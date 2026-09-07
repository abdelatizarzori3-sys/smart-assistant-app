import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(), openId: varchar("openId", { length: 64 }).notNull().unique(), name: text("name"), email: varchar("email", { length: 320 }), loginMethod: varchar("loginMethod", { length: 64 }), role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(), lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const workspaceSessions = mysqlTable("workspace_sessions", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull().references(() => users.id), title: varchar("title", { length: 240 }).notNull(), skillId: varchar("skillId", { length: 80 }).default("general").notNull(), status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("workspace_sessions_user_updated_idx").on(table.userId, table.updatedAt), index("workspace_sessions_user_skill_updated_idx").on(table.userId, table.skillId, table.updatedAt)]);

export const workspaceMessages = mysqlTable("workspace_messages", {
  id: int("id").autoincrement().primaryKey(), sessionId: int("sessionId").notNull().references(() => workspaceSessions.id), role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(), content: text("content").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("workspace_messages_session_created_idx").on(table.sessionId, table.createdAt)]);

export const workspaceFiles = mysqlTable("workspace_files", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull().references(() => users.id), sessionId: int("sessionId").references(() => workspaceSessions.id), fileName: varchar("fileName", { length: 255 }).notNull(), mimeType: varchar("mimeType", { length: 160 }).notNull(), sizeBytes: int("sizeBytes").notNull(), storageKey: varchar("storageKey", { length: 512 }).notNull().unique(), storageUrl: varchar("storageUrl", { length: 700 }).notNull(), status: mysqlEnum("status", ["ready", "processing", "failed"]).default("ready").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("workspace_files_user_created_idx").on(table.userId, table.createdAt), index("workspace_files_session_created_idx").on(table.sessionId, workspaceFiles.id)]);

export const workspaceResults = mysqlTable("workspace_results", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull().references(() => users.id), sessionId: int("sessionId").notNull().references(() => workspaceSessions.id), messageId: int("messageId").notNull().references(() => workspaceMessages.id), title: varchar("title", { length: 240 }).notNull(), content: text("content").notNull(), model: varchar("model", { length: 120 }).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("workspace_results_user_created_idx").on(table.userId, table.createdAt), index("workspace_results_session_created_idx").on(table.sessionId, workspaceResults.createdAt)]);

export const billingSubscriptions = mysqlTable("billing_subscriptions", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull().references(() => users.id), planId: varchar("planId", { length: 32 }).default("free").notNull(), provider: varchar("provider", { length: 32 }).default("paypal").notNull(), providerSubscriptionId: varchar("providerSubscriptionId", { length: 190 }), status: mysqlEnum("status", ["active", "pending", "cancelled", "expired", "suspended"]).default("pending").notNull(), currentPeriodStart: timestamp("currentPeriodStart"), currentPeriodEnd: timestamp("currentPeriodEnd"), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("billing_subscriptions_user_idx").on(table.userId), index("billing_subscriptions_provider_id_idx").on(table.provider, table.providerSubscriptionId)]);

export const billingUsage = mysqlTable("billing_usage", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull().references(() => users.id), periodKey: varchar("periodKey", { length: 16 }).notNull(), messageCount: int("messageCount").default(0).notNull(), toolExecutionCount: int("toolExecutionCount").default(0).notNull(), tokenCount: int("tokenCount").default(0).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("billing_usage_user_period_idx").on(table.userId, table.periodKey)]);

export const billingEvents = mysqlTable("billing_events", {
  id: int("id").autoincrement().primaryKey(), provider: varchar("provider", { length: 32 }).notNull(), eventId: varchar("eventId", { length: 190 }).notNull().unique(), eventType: varchar("eventType", { length: 120 }).notNull(), userId: int("userId").references(() => users.id), payload: text("payload").notNull(), processedAt: timestamp("processedAt"), createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("billing_events_user_created_idx").on(table.userId, table.createdAt)]);

export const userIntegrations = mysqlTable("user_integrations", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull().references(() => users.id), provider: varchar("provider", { length: 64 }).notNull(), accountId: varchar("accountId", { length: 190 }), accountName: varchar("accountName", { length: 255 }), accessTokenEncrypted: text("accessTokenEncrypted").notNull(), refreshTokenEncrypted: text("refreshTokenEncrypted"), expiresAt: timestamp("expiresAt"), scopes: text("scopes"), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("user_integrations_user_idx").on(table.userId), index("user_integrations_user_provider_unique").on(table.userId, table.provider)]);

export type WorkspaceSession = typeof workspaceSessions.$inferSelect;
export type WorkspaceMessage = typeof workspaceMessages.$inferSelect;
export type WorkspaceFile = typeof workspaceFiles.$inferSelect;
export type WorkspaceResult = typeof workspaceResults.$inferSelect;
export type BillingSubscription = typeof billingSubscriptions.$inferSelect;
export type BillingUsage = typeof billingUsage.$inferSelect;
export type BillingEvent = typeof billingEvents.$inferSelect;
export type UserIntegration = typeof userIntegrations.$inferSelect;
