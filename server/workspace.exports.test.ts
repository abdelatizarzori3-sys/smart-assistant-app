import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  archiveWorkspaceSession: vi.fn(),
  archiveWorkspaceSessionAsAdmin: vi.fn(),
  attachWorkspaceFilesToSession: vi.fn(),
  createWorkspaceFile: vi.fn(),
  createWorkspaceMessage: vi.fn(),
  createWorkspaceResult: vi.fn(),
  createWorkspaceSession: vi.fn(),
  getWorkspaceAdminOverview: vi.fn(),
  getWorkspaceFilesByIdsForUser: vi.fn(),
  getWorkspaceSessionForUser: vi.fn(),
  listRecentWorkspaceResults: vi.fn(),
  listWorkspaceFilesForSession: vi.fn(),
  listWorkspaceFilesForUser: vi.fn(),
  listWorkspaceMessages: vi.fn(),
  listWorkspaceSessions: vi.fn(),
  updateWorkspaceSessionTitle: vi.fn(),
}));

const entitlementMocks = vi.hoisted(() => ({
  getProExportEntitlement: vi.fn(),
  getProExportPurchaseStatus: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/proExportEntitlement", () => entitlementMocks);

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const now = new Date("2026-10-31T08:00:00Z");

function createContext(userId = 7): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `export-user-${userId}`,
      name: "مستخدم التصدير",
      email: "export@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("workspace.exports.markdown", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    dbMocks.getWorkspaceSessionForUser.mockResolvedValue({
      id: 4,
      userId: 7,
      title: "خطة <العميل>",
      status: "active",
      createdAt: new Date("2026-10-29T08:00:00Z"),
      updatedAt: new Date("2026-10-30T09:00:00Z"),
    });
    entitlementMocks.getProExportEntitlement.mockResolvedValue({ granted: true, reason: "active" });
    entitlementMocks.getProExportPurchaseStatus.mockReturnValue({ configured: false, state: "setup_required" });
    dbMocks.listWorkspaceMessages.mockResolvedValue([
      { id: 1, sessionId: 4, role: "user", content: "أريد خطة تنفيذ.", createdAt: new Date("2026-10-29T08:01:00Z") },
      { id: 2, sessionId: 4, role: "assistant", content: "<b>هذه</b> خطة عملية.", createdAt: new Date("2026-10-29T08:02:00Z") },
    ]);
    dbMocks.listWorkspaceFilesForSession.mockResolvedValue([
      {
        id: 10,
        userId: 7,
        sessionId: 4,
        fileName: "ملخص العميل.pdf",
        mimeType: "application/pdf",
        sizeBytes: 99,
        storageKey: "users/7/private/summary.pdf",
        storageUrl: "https://signed.example/private/summary.pdf",
        status: "ready",
        createdAt: now,
      },
    ]);
  });

  it("exports the owner's actual messages and attachment names without storage data", async () => {
    const result = await appRouter.createCaller(createContext()).workspace.exports.markdown({ sessionId: 4 });

    expect(dbMocks.getWorkspaceSessionForUser).toHaveBeenCalledWith(4, 7);
    expect(dbMocks.listWorkspaceMessages).toHaveBeenCalledWith(4, 1001);
    expect(dbMocks.listWorkspaceFilesForSession).toHaveBeenCalledWith(4, 7, 251);
    expect(result.fileName).toMatch(/^smart-assistant-session-.*\.md$/);
    expect(result.markdown).toContain("أريد خطة تنفيذ.");
    expect(result.markdown).toContain("&lt;b&gt;هذه&lt;/b&gt; خطة عملية.");
    expect(result.markdown).toContain("ملخص العميل.pdf");
    expect(result.markdown).not.toContain("users/7/private/summary.pdf");
    expect(result.markdown).not.toContain("https://signed.example/private/summary.pdf");
    expect(result.markdown).not.toContain("application/pdf");
  });

  it("fails closed when no verified Pro entitlement exists", async () => {
    entitlementMocks.getProExportEntitlement.mockResolvedValue({ granted: false, reason: "purchase_setup_required" });

    await expect(appRouter.createCaller(createContext()).workspace.exports.markdown({ sessionId: 4 }))
      .rejects.toMatchObject({ code: "PRECONDITION_FAILED" });

    expect(dbMocks.listWorkspaceMessages).not.toHaveBeenCalled();
    expect(dbMocks.listWorkspaceFilesForSession).not.toHaveBeenCalled();
  });

  it("rejects an invalid session identifier before accessing workspace data", async () => {
    await expect(appRouter.createCaller(createContext()).workspace.exports.markdown({ sessionId: 0 }))
      .rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(dbMocks.getWorkspaceSessionForUser).not.toHaveBeenCalled();
    expect(entitlementMocks.getProExportEntitlement).not.toHaveBeenCalled();
  });

  it("rejects a session not owned by the authenticated user before checking entitlement", async () => {
    dbMocks.getWorkspaceSessionForUser.mockResolvedValue(undefined);

    await expect(appRouter.createCaller(createContext()).workspace.exports.markdown({ sessionId: 999 }))
      .rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(entitlementMocks.getProExportEntitlement).not.toHaveBeenCalled();
    expect(dbMocks.listWorkspaceMessages).not.toHaveBeenCalled();
  });

  it("reports that purchase wiring remains required instead of claiming a checkout exists", async () => {
    entitlementMocks.getProExportEntitlement.mockResolvedValue({ granted: false, reason: "purchase_setup_required" });

    await expect(appRouter.createCaller(createContext()).workspace.exports.status()).resolves.toEqual({
      canExport: false,
      entitlement: "purchase_setup_required",
      purchase: { configured: false, state: "setup_required" },
    });
  });
});
