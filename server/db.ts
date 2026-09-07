import { and, count, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  workspaceFiles,
  workspaceMessages,
  workspaceResults,
  workspaceSessions,
  billingSubscriptions,
  billingUsage,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getBillingPlan } from "./_core/billing";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}
function requireDb(db: Awaited<ReturnType<typeof getDb>>) { if (!db) throw new Error("Database is not available"); return db; }

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId }; const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) if (user[field] !== undefined) { const value = user[field] ?? null; values[field] = value; updateSet[field] = value; }
  values.lastSignedIn = user.lastSignedIn ?? new Date(); updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }
export async function createWorkspaceSession(userId: number, title: string, skillId = "general") { const db = requireDb(await getDb()); const result = await db.insert(workspaceSessions).values({ userId, title, skillId }); return getWorkspaceSessionForUser(Number(result[0].insertId), userId); }
export async function listWorkspaceSessions(userId: number, skillId?: string) { const db = requireDb(await getDb()); const conditions = [eq(workspaceSessions.userId, userId)]; if (skillId) conditions.push(eq(workspaceSessions.skillId, skillId)); return db.select().from(workspaceSessions).where(and(...conditions)).orderBy(desc(workspaceSessions.updatedAt)); }
export async function getWorkspaceSessionForUser(sessionId: number, userId: number) { const db = requireDb(await getDb()); const result = await db.select().from(workspaceSessions).where(and(eq(workspaceSessions.id, sessionId), eq(workspaceSessions.userId, userId))).limit(1); return result[0]; }
export async function updateWorkspaceSessionTitle(sessionId: number, userId: number, title: string) { const db = requireDb(await getDb()); await db.update(workspaceSessions).set({ title }).where(and(eq(workspaceSessions.id, sessionId), eq(workspaceSessions.userId, userId))); return getWorkspaceSessionForUser(sessionId, userId); }
export async function archiveWorkspaceSession(sessionId: number, userId: number) { const db = requireDb(await getDb()); await db.update(workspaceSessions).set({ status: "archived" }).where(and(eq(workspaceSessions.id, sessionId), eq(workspaceSessions.userId, userId))); }
export async function archiveWorkspaceSessionAsAdmin(sessionId: number) { const db = requireDb(await getDb()); await db.update(workspaceSessions).set({ status: "archived" }).where(eq(workspaceSessions.id, sessionId)); return { success: true } as const; }
export async function listWorkspaceMessages(sessionId: number) { const db = requireDb(await getDb()); return db.select().from(workspaceMessages).where(eq(workspaceMessages.sessionId, sessionId)).orderBy(workspaceMessages.createdAt); }

async function recordMessageUsage(db: ReturnType<typeof drizzle>, userId: number) {
  const now = new Date(); const key = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const [subscription] = await db.select().from(billingSubscriptions).where(and(eq(billingSubscriptions.userId, userId), eq(billingSubscriptions.status, "active"))).orderBy(desc(billingSubscriptions.updatedAt)).limit(1);
  const [existing] = await db.select().from(billingUsage).where(and(eq(billingUsage.userId, userId), eq(billingUsage.periodKey, key))).limit(1);
  if (existing) await db.update(billingUsage).set({ messageCount: existing.messageCount + 1, updatedAt: now }).where(eq(billingUsage.id, existing.id));
  else await db.insert(billingUsage).values({ userId, periodKey: key, messageCount: 1, toolExecutionCount: 0, tokenCount: 0 });
  const plan = getBillingPlan(subscription?.planId);
  const [current] = await db.select().from(billingUsage).where(and(eq(billingUsage.userId, userId), eq(billingUsage.periodKey, key))).limit(1);
  return { plan, usage: current };
}

export async function createWorkspaceMessage(input: { sessionId: number; role: "user" | "assistant" | "system"; content: string; }) {
  const db = requireDb(await getDb());
  const session = await db.select({ userId: workspaceSessions.userId }).from(workspaceSessions).where(eq(workspaceSessions.id, input.sessionId)).limit(1);
  const result = await db.insert(workspaceMessages).values(input); const id = Number(result[0].insertId);
  const created = await db.select().from(workspaceMessages).where(eq(workspaceMessages.id, id)).limit(1);
  await db.update(workspaceSessions).set({ updatedAt: new Date() }).where(eq(workspaceSessions.id, input.sessionId));
  if (input.role === "user" && session[0]?.userId) await recordMessageUsage(db, session[0].userId);
  return created[0];
}
export async function createWorkspaceFile(input: { userId: number; sessionId?: number | null; fileName: string; mimeType: string; sizeBytes: number; storageKey: string; storageUrl: string; }) { const db = requireDb(await getDb()); const result = await db.insert(workspaceFiles).values(input); const id = Number(result[0].insertId); const created = await db.select().from(workspaceFiles).where(eq(workspaceFiles.id, id)).limit(1); return created[0]; }
export async function listWorkspaceFilesForUser(userId: number) { const db = requireDb(await getDb()); return db.select().from(workspaceFiles).where(eq(workspaceFiles.userId, userId)).orderBy(desc(workspaceFiles.createdAt)); }
export async function listWorkspaceFilesForSession(sessionId: number, userId: number) { const db = requireDb(await getDb()); return db.select().from(workspaceFiles).where(and(eq(workspaceFiles.sessionId, sessionId), eq(workspaceFiles.userId, userId))).orderBy(desc(workspaceFiles.createdAt)); }
export async function listWorkspaceFilesForSkill(userId: number, skillId: string) { const db = requireDb(await getDb()); return db.select({ id: workspaceFiles.id, fileName: workspaceFiles.fileName, mimeType: workspaceFiles.mimeType, sizeBytes: workspaceFiles.sizeBytes, status: workspaceFiles.status, createdAt: workspaceFiles.createdAt, sessionId: workspaceFiles.sessionId }).from(workspaceFiles).innerJoin(workspaceSessions, eq(workspaceFiles.sessionId, workspaceSessions.id)).where(and(eq(workspaceFiles.userId, userId), eq(workspaceSessions.skillId, skillId))).orderBy(desc(workspaceFiles.createdAt)); }
export async function getWorkspaceFilesByIdsForUser(fileIds: number[], userId: number) { if (fileIds.length === 0) return []; const db = requireDb(await getDb()); return db.select().from(workspaceFiles).where(and(eq(workspaceFiles.userId, userId), inArray(workspaceFiles.id, fileIds))); }
export async function attachWorkspaceFilesToSession(fileIds: number[], userId: number, sessionId: number) { if (fileIds.length === 0) return; const db = requireDb(await getDb()); await db.update(workspaceFiles).set({ sessionId }).where(and(eq(workspaceFiles.userId, userId), inArray(workspaceFiles.id, fileIds))); }
export async function createWorkspaceResult(input: { userId: number; sessionId: number; messageId: number; title: string; content: string; model: string; }) { const db = requireDb(await getDb()); const result = await db.insert(workspaceResults).values(input); const id = Number(result[0].insertId); const created = await db.select().from(workspaceResults).where(eq(workspaceResults.id, id)).limit(1); return created[0]; }
export async function listRecentWorkspaceResults(userId: number, skillId?: string) { const db = requireDb(await getDb()); return db.select({ id: workspaceResults.id, title: workspaceResults.title, content: workspaceResults.content, model: workspaceResults.model, createdAt: workspaceResults.createdAt, sessionId: workspaceResults.sessionId, sessionTitle: workspaceSessions.title }).from(workspaceResults).innerJoin(workspaceSessions, eq(workspaceResults.sessionId, workspaceSessions.id)).where(skillId ? and(eq(workspaceResults.userId, userId), eq(workspaceSessions.skillId, skillId)) : eq(workspaceResults.userId, userId)).orderBy(desc(workspaceResults.createdAt)).limit(8); }
export async function getWorkspaceAdminOverview() { const db = requireDb(await getDb()); const [sessions] = await db.select({ total: count() }).from(workspaceSessions); const [messages] = await db.select({ total: count() }).from(workspaceMessages); const [files] = await db.select({ total: count() }).from(workspaceFiles); const [results] = await db.select({ total: count() }).from(workspaceResults); return { sessions: sessions?.total ?? 0, messages: messages?.total ?? 0, files: files?.total ?? 0, results: results?.total ?? 0 }; }
