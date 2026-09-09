import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { deleteUserIntegration, getUserIntegration, listUserIntegrations, upsertUserIntegration } from "./integrationsDb";
import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

const PROVIDERS = {
  github: {
    label: "GitHub",
    authorize: "https://github.com/login/oauth/authorize",
    token: "https://github.com/login/oauth/access_token",
    user: "https://api.github.com/user",
    email: "https://api.github.com/user/emails",
    scopes: ["repo", "read:user", "user:email"],
  },
} as const;

type ProviderId = keyof typeof PROVIDERS;
const STATE_COOKIE = "__Host-integration_oauth_state";
const STATE_MAX_AGE = 10 * 60 * 1000;

function providerOr404(provider: string) {
  return PROVIDERS[provider as ProviderId];
}

function publicOrigin(req: Request) {
  const configured = process.env.APP_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0];
  const proto = forwardedProto || (req.secure ? "https" : "http");
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "localhost").split(",")[0];
  return `${proto}://${host}`;
}

function getGithubConfig() {
  return {
    clientId: process.env.GITHUB_CLIENT_ID?.trim() || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim() || "",
    redirectUri: process.env.GITHUB_REDIRECT_URI?.trim() || "",
  };
}

function encrypt(value: string) {
  const key = crypto.createHash("sha256").update(ENV.cookieSecret || "integration-secret").digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

function isSafeRedirectPath(value: unknown): value is string {
  return typeof value === "string" && /^\/(?!\/)/.test(value) && !/[\r\n]/.test(value);
}

function buildState(nonce: string, redirectPath: string) {
  return Buffer.from(JSON.stringify({ nonce, redirectPath }), "utf8").toString("base64url");
}

function readState(raw: string) {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (typeof parsed?.nonce === "string" && typeof parsed?.redirectPath === "string") return parsed as { nonce: string; redirectPath: string };
  } catch {}
  return null;
}

async function requireUser(req: Request) {
  return sdk.authenticateRequest(req);
}

function buildLoginResumePath(providerId: ProviderId, redirectPath: string) {
  const start = new URLSearchParams({ redirect: redirectPath });
  return `/api/integrations/${providerId}/start?${start.toString()}`;
}

function redirectToAppLogin(req: Request, res: Response, providerId: ProviderId, redirectPath: string) {
  if (!ENV.appId || !ENV.oAuthPortalUrl) {
    return res.status(401).json({ error: "unauthorized", message: "تسجيل الدخول مطلوب قبل ربط الحساب." });
  }

  const returnPath = buildLoginResumePath(providerId, redirectPath);
  const nonce = crypto.randomBytes(32).toString("base64url");
  const state = encodeOAuthState({
    redirectUri: `${publicOrigin(req)}/api/oauth/callback`,
    nonce,
    returnPath,
  });

  res.cookie(OAUTH_STATE_COOKIE, nonce, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 10 * 60 * 1000,
  });

  const url = new URL(`${ENV.oAuthPortalUrl.replace(/\/$/, "")}/app-auth`);
  url.searchParams.set("appId", ENV.appId);
  url.searchParams.set("redirectUri", `${publicOrigin(req)}/api/oauth/callback`);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return res.redirect(302, url.toString());
}

export function registerIntegrationRoutes(app: Express) {
  app.get("/api/integrations", async (req, res) => {
    try {
      const user = await requireUser(req);
      const connected = await listUserIntegrations(user.id);
      const connectedMap = new Map(connected.map(item => [item.provider, item]));
      res.json({
        providers: Object.entries(PROVIDERS).map(([id, provider]) => ({
          id,
          name: provider.label,
          connected: connectedMap.has(id),
          accountName: connectedMap.get(id)?.accountName ?? null,
          scopes: connectedMap.get(id)?.scopes ? String(connectedMap.get(id)?.scopes).split(" ").filter(Boolean) : [],
        })),
      });
    } catch {
      res.status(401).json({ error: "unauthorized" });
    }
  });

  app.get("/api/integrations/:provider/start", async (req, res) => {
    const providerId = req.params.provider as ProviderId;
    const provider = providerOr404(providerId);
    if (!provider) return res.status(404).json({ error: "provider_not_supported" });

    const redirectPath = isSafeRedirectPath(req.query.redirect) ? req.query.redirect : "/workspace/integrations";

    try {
      await requireUser(req);
      const { clientId, clientSecret, redirectUri: configuredRedirectUri } = getGithubConfig();
      if (providerId === "github" && (!clientId || !clientSecret)) {
        return res.status(503).json({ error: "github_oauth_not_configured", message: "GITHUB_CLIENT_ID و GITHUB_CLIENT_SECRET غير مهيئين بعد." });
      }

      const nonce = crypto.randomBytes(32).toString("base64url");
      const state = buildState(nonce, redirectPath);
      res.cookie(STATE_COOKIE, nonce, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: STATE_MAX_AGE,
      });
      const redirectUri = configuredRedirectUri || `${publicOrigin(req)}/api/integrations/${providerId}/callback`;
      const url = new URL(provider.authorize);
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("scope", provider.scopes.join(" "));
      url.searchParams.set("state", state);
      return res.redirect(302, url.toString());
    } catch (error) {
      console.warn("[Integrations] login required; resuming after app auth", error);
      return redirectToAppLogin(req, res, providerId, redirectPath);
    }
  });

  app.get("/api/integrations/:provider/callback", async (req: Request, res: Response) => {
    const providerId = req.params.provider as ProviderId;
    const provider = providerOr404(providerId);
    if (!provider) return res.status(404).send("مزود غير مدعوم");

    const code = typeof req.query.code === "string" ? req.query.code : "";
    const rawState = typeof req.query.state === "string" ? req.query.state : "";
    const state = readState(rawState);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[STATE_COOKIE];
    res.clearCookie(STATE_COOKIE, { path: "/", secure: true, sameSite: "lax" });

    if (!code || !state || !expectedNonce || state.nonce !== expectedNonce) {
      return res.status(403).send("فشل التحقق الأمني لعملية التفويض. أعد المحاولة.");
    }

    try {
      const user = await requireUser(req);
      const { clientId, clientSecret, redirectUri: configuredRedirectUri } = getGithubConfig();
      if (providerId === "github" && (!clientId || !clientSecret)) return res.status(503).send("GitHub OAuth غير مهيأ على الخادم.");
      const redirectUri = configuredRedirectUri || `${publicOrigin(req)}/api/integrations/${providerId}/callback`;
      const tokenResponse = await fetch(provider.token, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
      });
      const token = await tokenResponse.json() as { access_token?: string; token_type?: string; scope?: string; error?: string };
      if (!tokenResponse.ok || !token.access_token) throw new Error(token.error || "Token exchange failed");

      const headers = { Authorization: `Bearer ${token.access_token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
      const profileResponse = await fetch(provider.user, { headers });
      if (!profileResponse.ok) throw new Error(`GitHub profile request failed: ${profileResponse.status}`);
      const profile = await profileResponse.json() as { id?: number; login?: string; name?: string; email?: string | null };
      let email = profile.email ?? null;
      if (!email && providerId === "github") {
        const emailsResponse = await fetch(provider.email, { headers });
        if (emailsResponse.ok) {
          const emails = await emailsResponse.json() as Array<{ email?: string; primary?: boolean; verified?: boolean }>;
          email = emails.find(item => item.primary && item.verified)?.email ?? emails.find(item => item.verified)?.email ?? null;
        }
      }

      await upsertUserIntegration({
        userId: user.id,
        provider: providerId,
        accountId: profile.id ? String(profile.id) : null,
        accountName: profile.login || profile.name || email,
        accessTokenEncrypted: encrypt(token.access_token),
        scopes: token.scope || provider.scopes.join(" "),
      });

      const redirectPath = isSafeRedirectPath(state.redirectPath) ? state.redirectPath : "/workspace/integrations";
      return res.redirect(302, `${publicOrigin(req)}${redirectPath}?connected=${encodeURIComponent(providerId)}`);
    } catch (error) {
      console.error("[Integrations] callback failed", error);
      return res.status(500).send("تعذر إكمال ربط الحساب. تحقق من إعدادات OAuth ثم حاول مرة أخرى.");
    }
  });

  app.delete("/api/integrations/:provider", async (req, res) => {
    try {
      const user = await requireUser(req);
      const provider = providerOr404(req.params.provider);
      if (!provider) return res.status(404).json({ error: "provider_not_supported" });
      await deleteUserIntegration(user.id, req.params.provider);
      res.json({ success: true });
    } catch {
      res.status(401).json({ error: "unauthorized" });
    }
  });

  app.get("/api/integrations/:provider/status", async (req, res) => {
    try {
      const user = await requireUser(req);
      const provider = providerOr404(req.params.provider);
      if (!provider) return res.status(404).json({ error: "provider_not_supported" });
      const integration = await getUserIntegration(user.id, req.params.provider);
      res.json({ connected: Boolean(integration), accountName: integration?.accountName ?? null, scopes: integration?.scopes ? String(integration.scopes).split(" ").filter(Boolean) : [] });
    } catch {
      res.status(401).json({ error: "unauthorized" });
    }
  });
}
