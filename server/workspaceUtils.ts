export function createSessionTitle(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return "محادثة جديدة";
  return normalized.length > 48 ? `${normalized.slice(0, 48).trim()}…` : normalized;
}

/** Normalize model output at the presentation boundary without changing Markdown structure. */
export function normalizeAssistantText(content: string) {
  return content
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(line => {
      if (!/[\u0600-\u06FF]/.test(line)) return line;
      return line
        .replace(/\?(?=\s*$)/g, "؟")
        .replace(/\?\s+(?=•|-|\*)/g, "؟ ");
    })
    .join("\n")
    .replace(/\uFFFD/g, "")
    .trim();
}

export function extractAssistantText(content: string | Array<{ type: "text"; text: string }>) {
  const text = typeof content === "string" ? content : content.map(part => part.text).join("\n");
  return normalizeAssistantText(text);
}

export function isSupportedAudio(mimeType: string) {
  return ["audio/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"].includes(mimeType);
}
