import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { parse as parseCookieHeader } from "cookie";
import { randomUUID } from "node:crypto";
import * as db from "../db";
import { sdk } from "./sdk";

const GUEST_COOKIE = "nawaa_guest_id";
const GUEST_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

async function getOrCreateGuestUser(opts: CreateExpressContextOptions): Promise<User | null> {
  if (process.env.NODE_ENV !== "production" || !process.env.DATABASE_URL) return null;

  const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
  const existing = cookies[GUEST_COOKIE];
  const guestId = typeof existing === "string" && /^[a-f0-9-]{20,80}$/i.test(existing) ? existing : randomUUID();

  if (!existing) {
    opts.res.cookie(GUEST_COOKIE, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: GUEST_MAX_AGE_MS,
      path: "/",
    });
  }

  const openId = `guest_${guestId}`;
  await db.upsertUser({
    openId,
    name: "مساحتي في نواة",
    email: null,
    loginMethod: "guest",
    role: "user",
    lastSignedIn: new Date(),
  });

  return (await db.getUserByOpenId(openId)) ?? null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Independent Railway/Vercel deployments do not require Manus OAuth.
    // When no valid OAuth session exists, create a private browser guest session.
    try {
      user = await getOrCreateGuestUser(opts);
    } catch (guestError) {
      console.error("[Auth] Guest session creation failed:", guestError);
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
