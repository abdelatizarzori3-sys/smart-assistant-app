import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  archiveWorkspaceSession: vi.fn(),
  archiveWorkspaceSessionAsAdmin: vi.fn().mockResolvedValue({ success: true }),
  attachWorkspaceFilesToSession: vi.fn(),
  createWorkspaceFile: vi.fn(),
  createWorkspaceMessage: vi.fn(),
  createWorkspaceResult: vi.fn(),
  createWorkspaceSession: vi.fn(),
  getWorkspaceAdminOverview: vi.fn().mockResolvedValue({ sessions: 3, messages: 8, files: 2, results: 4 }),
  getWorkspaceFilesByIdsForUser: vi.fn(),
  getWorkspaceSessionForUser: vi.fn(),
  listRecentWorkspaceResults: vi.fn(),
  listWorkspaceFilesForSession: vi.fn(),
  listWorkspaceFilesForUser: vi.fn(),
  listWorkspaceMessages: vi.fn(),
  listWorkspaceSessions: vi.fn(),
  updateWorkspaceSessionTitle: vi.fn(),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "workspace-test-user",
      name: "مالك مساحة العمل",
      email: "owner@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("workspace.admin", () => {
  it("rejects access for a non-admin user", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.workspace.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.workspace.admin.archiveSession({ sessionId: 9 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows the workspace owner to view sensitive operational totals", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.workspace.admin.overview()).resolves.toEqual({ sessions: 3, messages: 8, files: 2, results: 4 });
    await expect(caller.workspace.admin.archiveSession({ sessionId: 9 })).resolves.toEqual({ success: true });
  });
});
