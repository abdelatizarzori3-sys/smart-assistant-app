const MAX_TEXT_BYTES = 2 * 1024 * 1024;
const MAX_TEXT_CHARS = 80_000;

const TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/tab-separated-values",
  "text/xml",
  "application/json",
  "application/xml",
  "application/javascript",
  "application/typescript",
]);

export function isTextLikeFile(mimeType: string, fileName: string) {
  if (TEXT_MIME_TYPES.has(mimeType.toLowerCase())) return true;
  const lower = fileName.toLowerCase();
  return /\.(txt|md|markdown|csv|tsv|json|xml|html|htm|js|jsx|ts|tsx|css|scss|yaml|yml|sql|log|env)$/i.test(lower);
}

export function extractTextFromBuffer(buffer: Buffer) {
  if (buffer.byteLength > MAX_TEXT_BYTES) return buffer.subarray(0, MAX_TEXT_BYTES).toString("utf8").slice(0, MAX_TEXT_CHARS);
  return buffer.toString("utf8").slice(0, MAX_TEXT_CHARS);
}

export { MAX_TEXT_BYTES, MAX_TEXT_CHARS };
