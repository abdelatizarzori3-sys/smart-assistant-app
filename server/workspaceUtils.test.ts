import { describe, expect, it } from "vitest";
import { createSessionTitle, extractAssistantText, isSupportedAudio } from "./workspaceUtils";

describe("workspace helpers", () => {
  it("creates a concise session title from the first request", () => {
    expect(createSessionTitle("   أحتاج  خطة   عمل  ")).toBe("أحتاج خطة عمل");
    expect(createSessionTitle("" )).toBe("محادثة جديدة");
  });

  it("normalizes assistant response content and identifies accepted audio formats", () => {
    expect(extractAssistantText([{ type: "text", text: "مرحبًا" }, { type: "text", text: "بك" }])).toBe("مرحبًا\nبك");
    expect(isSupportedAudio("audio/webm")).toBe(true);
    expect(isSupportedAudio("application/pdf")).toBe(false);
  });
});

