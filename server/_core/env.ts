export const ENV = {
  // Keep compatibility with both the original Manus/Vite variable names and
  // the server-side OAuth names used by independent Railway deployments.
  appId: process.env.VITE_APP_ID ?? process.env.OAUTH_CLIENT_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl:
    process.env.OAUTH_SERVER_URL ?? "https://api.manus.im",
  oAuthPortalUrl:
    process.env.OAUTH_PORTAL_URL ?? "https://login.manus.im",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Manus Forge remains supported for existing deployments, while standard
  // OpenAI-compatible configuration can be used on independent infrastructure.
  forgeApiUrl:
    process.env.BUILT_IN_FORGE_API_URL ??
    process.env.OPENAI_API_URL ??
    "https://api.openai.com",
  forgeApiKey:
    process.env.BUILT_IN_FORGE_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
};
