import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Manus OAuth login. The server supplies the public app ID and
// portal URL so Railway deployments do not depend on VITE_* build-time vars.
// The existing VITE_* values remain supported as a fast path.
export const startLogin = async () => {
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  let oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL as string | undefined;
  let appId = import.meta.env.VITE_APP_ID as string | undefined;

  if (!oauthPortalUrl || !appId) {
    try {
      const response = await fetch("/api/oauth/config", {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const config = (await response.json()) as {
          appId?: string;
          portalUrl?: string;
        };
        appId = appId || config.appId;
        oauthPortalUrl = oauthPortalUrl || config.portalUrl;
      }
    } catch (error) {
      console.error("[OAuth] Failed to load login configuration", error);
    }
  }

  if (!oauthPortalUrl || !appId) {
    console.error("[OAuth] Login configuration is unavailable");
    return;
  }

  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  window.location.href = url.toString();
};
