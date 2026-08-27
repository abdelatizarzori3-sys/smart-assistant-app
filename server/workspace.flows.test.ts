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

const llmMocks = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
  listLLMModels: vi.fn(),
}));

const storageMocks = vi.hoisted(() => ({
  storageGetSignedUrl: vi.fn(),
  storagePut: vi.fn(),
}));

const voiceMocks = vi.hoisted(() => ({ transcribeAudio: vi.fn() }));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/llm", () => llmMocks);
vi.mock("./storage", () => storageMocks);
vi.mock("./_core/voiceTranscription", () => voiceMocks);

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const now = new Date("2026-08-27T10:00:00Z");

function createContext(): TrpcContext {
  return {
    user: {
      id: 7,
      openId: "workspace-flow-user",
      name: "مستخدم الاختبار",
      email: "test@example.com",
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

describe("workspace flows", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    dbMocks.getWorkspaceSessionForUser.mockResolvedValue({ id: 4, userId: 7, title: "محادثة جديدة", status: "active", createdAt: now, updatedAt: now });
    dbMocks.getWorkspaceFilesByIdsForUser.mockResolvedValue([]);
    dbMocks.listWorkspaceMessages.mockResolvedValue([]);
    dbMocks.createWorkspaceMessage
      .mockResolvedValueOnce({ id: 11, sessionId: 4, role: "user", content: "اكتب خطة", createdAt: now })
      .mockResolvedValueOnce({ id: 12, sessionId: 4, role: "assistant", content: "هذه خطة عملية.", createdAt: now });
    dbMocks.createWorkspaceResult.mockResolvedValue({ id: 3, sessionId: 4, messageId: 12, userId: 7, title: "هذه خطة عملية.", content: "هذه خطة عملية.", model: "gpt-5-mini", createdAt: now });
    llmMocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-mini" }] });
    llmMocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "هذه خطة عملية." } }] });
    storageMocks.storagePut.mockResolvedValue({ key: "users/7/brief_ab12.pdf", url: "/manus-storage/users/7/brief_ab12.pdf" });
    dbMocks.createWorkspaceFile.mockResolvedValue({ id: 21, userId: 7, fileName: "brief.pdf", mimeType: "application/pdf", sizeBytes: 3, storageKey: "users/7/brief_ab12.pdf", storageUrl: "/manus-storage/users/7/brief_ab12.pdf", status: "ready", createdAt: now });
    voiceMocks.transcribeAudio.mockResolvedValue({ text: "مرحبًا من الرسالة الصوتية", language: "ar" });
  });

  it("creates a new user-owned session", async () => {
    dbMocks.createWorkspaceSession.mockResolvedValue({ id: 8, userId: 7, title: "بحث جديد", status: "active", createdAt: now, updatedAt: now });
    const result = await appRouter.createCaller(createContext()).workspace.sessions.create({ title: "بحث جديد" });
    expect(dbMocks.createWorkspaceSession).toHaveBeenCalledWith(7, "بحث جديد");
    expect(result.id).toBe(8);
  });

  it("stores a user message, invokes the approved model, and saves the generated result", async () => {
    const result = await appRouter.createCaller(createContext()).workspace.messages.send({ sessionId: 4, content: "اكتب خطة", fileIds: [] });
    expect(dbMocks.attachWorkspaceFilesToSession).toHaveBeenCalledWith([], 7, 4);
    expect(llmMocks.invokeLLM).toHaveBeenCalledWith(expect.objectContaining({ model: "gpt-5-mini" }));
    expect(dbMocks.createWorkspaceResult).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, sessionId: 4, messageId: 12, model: "gpt-5-mini" }));
    expect(result.assistantMessage.content).toBe("هذه خطة عملية.");
  });

  it("includes an owned PDF attachment in the model context for the active chat session", async () => {
    dbMocks.getWorkspaceFilesByIdsForUser.mockResolvedValue([{ id: 31, userId: 7, fileName: "notes.pdf", mimeType: "application/pdf", sizeBytes: 10, storageKey: "users/7/notes.pdf", storageUrl: "/manus-storage/users/7/notes.pdf", status: "ready", createdAt: now }]);
    storageMocks.storageGetSignedUrl.mockResolvedValue("https://signed.example/notes.pdf");
    await appRouter.createCaller(createContext()).workspace.messages.send({ sessionId: 4, content: "حلل هذا الملف", fileIds: [31] });
    expect(storageMocks.storageGetSignedUrl).toHaveBeenCalledWith("users/7/notes.pdf");
    const llmInput = llmMocks.invokeLLM.mock.calls[0]?.[0];
    expect(llmInput.messages.at(-1).content).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "file_url", file_url: expect.objectContaining({ url: "https://signed.example/notes.pdf" }) }),
    ]));
  });

  it("uploads a file into secured storage and saves only its metadata", async () => {
    const result = await appRouter.createCaller(createContext()).workspace.files.upload({
      fileName: "brief.pdf",
      mimeType: "application/pdf",
      sizeBytes: 3,
      dataBase64: Buffer.from("abc").toString("base64"),
      sessionId: 4,
    });
    expect(storageMocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("users/7/"), expect.any(Buffer), "application/pdf");
    expect(dbMocks.createWorkspaceFile).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, sessionId: 4, storageKey: "users/7/brief_ab12.pdf" }));
    expect(result.id).toBe(21);
  });

  it("transcribes an owned audio file before it becomes a chat prompt", async () => {
    dbMocks.getWorkspaceFilesByIdsForUser.mockResolvedValue([{ id: 22, userId: 7, fileName: "voice.webm", mimeType: "audio/webm", sizeBytes: 100, storageKey: "users/7/voice.webm", storageUrl: "/manus-storage/users/7/voice.webm", status: "ready", createdAt: now }]);
    storageMocks.storageGetSignedUrl.mockResolvedValue("https://signed.example/voice.webm");
    const result = await appRouter.createCaller(createContext()).workspace.voice.transcribe({ fileId: 22 });
    expect(voiceMocks.transcribeAudio).toHaveBeenCalledWith(expect.objectContaining({ language: "ar" }));
    expect(result).toEqual({ text: "مرحبًا من الرسالة الصوتية", language: "ar" });
  });
});
