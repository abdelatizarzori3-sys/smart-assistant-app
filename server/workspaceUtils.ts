export function createSessionTitle(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return "محادثة جديدة";
  return normalized.length > 48 ? `${normalized.slice(0, 48).trim()}…` : normalized;
}

export function extractAssistantText(content: string | Array<{ type: "text"; text: string }>) {
  return typeof content === "string" ? content : content.map(part => part.text).join("\n");
}

export function isSupportedAudio(mimeType: string) {
  return ["audio/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"].includes(mimeType);
}
