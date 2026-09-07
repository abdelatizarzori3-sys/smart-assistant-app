import { and, desc, eq } from "drizzle-orm";
import { userIntegrations } from "../drizzle/schema";
import { getDb } from "./db";

export type IntegrationRecord = typeof userIntegrations.$inferSelect;

export async function getUserIntegration(userId: number, provider: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(userIntegrations)
    .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.provider, provider)))
    .orderBy(desc(userIntegrations.updatedAt)).limit(1);
  return rows[0];
}

export async function listUserIntegrations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: userIntegrations.id,
    provider: userIntegrations.provider,
    accountId: userIntegrations.accountId,
    accountName: userIntegrations.accountName,
    expiresAt: userIntegrations.expiresAt,
    scopes: userIntegrations.scopes,
    createdAt: userIntegrations.createdAt,
    updatedAt: userIntegrations.updatedAt,
  }).from(userIntegrations).where(eq(userIntegrations.userId, userId)).orderBy(desc(userIntegrations.updatedAt));
}

export async function upsertUserIntegration(input: {
  userId: number;
  provider: string;
  accountId?: string | null;
  accountName?: string | null;
  accessTokenEncrypted: string;
  refreshTokenEncrypted?: string | null;
  expiresAt?: Date | null;
  scopes?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(userIntegrations).values(input).onDuplicateKeyUpdate({
    set: {
      accountId: input.accountId ?? null,
      accountName: input.accountName ?? null,
      accessTokenEncrypted: input.accessTokenEncrypted,
      refreshTokenEncrypted: input.refreshTokenEncrypted ?? null,
      expiresAt: input.expiresAt ?? null,
      scopes: input.scopes ?? null,
      updatedAt: new Date(),
    },
  });
  return getUserIntegration(input.userId, input.provider);
}

export async function deleteUserIntegration(userId: number, provider: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(userIntegrations).where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.provider, provider)));
}
