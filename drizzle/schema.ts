import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const workspaceSessions = mysqlTable(
  "workspace_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 240 }).notNull(),
    status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("workspace_sessions_user_updated_idx").on(table.userId, table.updatedAt)],
);

export const workspaceMessages = mysqlTable(
  "workspace_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId")
      .notNull()
      .references(() => workspaceSessions.id),
    role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("workspace_messages_session_created_idx").on(table.sessionId, table.createdAt)],
);

export const workspaceFiles = mysqlTable(
  "workspace_files",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    sessionId: int("sessionId").references(() => workspaceSessions.id),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 160 }).notNull(),
    sizeBytes: int("sizeBytes").notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
    storageUrl: varchar("storageUrl", { length: 700 }).notNull(),
    status: mysqlEnum("status", ["ready", "processing", "failed"]).default("ready").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("workspace_files_user_created_idx").on(table.userId, table.createdAt),
    index("workspace_files_session_created_idx").on(table.sessionId, table.createdAt),
  ],
);

export const workspaceResults = mysqlTable(
  "workspace_results",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    sessionId: int("sessionId")
      .notNull()
      .references(() => workspaceSessions.id),
    messageId: int("messageId")
      .notNull()
      .references(() => workspaceMessages.id),
    title: varchar("title", { length: 240 }).notNull(),
    content: text("content").notNull(),
    model: varchar("model", { length: 120 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("workspace_results_user_created_idx").on(table.userId, table.createdAt),
    index("workspace_results_session_created_idx").on(table.sessionId, table.createdAt),
  ],
);

export type WorkspaceSession = typeof workspaceSessions.$inferSelect;
export type WorkspaceMessage = typeof workspaceMessages.$inferSelect;
export type WorkspaceFile = typeof workspaceFiles.$inferSelect;
export type WorkspaceResult = typeof workspaceResults.$inferSelect;
