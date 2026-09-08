import crypto from "node:crypto";
import { ENV } from "./env";

function getKey() {
  return crypto.createHash("sha256").update(ENV.cookieSecret || "integration-secret").digest();
}

/** Decrypt secrets produced by the integration OAuth encryption format. */
export function decryptSecret(value: string) {
  const [ivPart, tagPart, encryptedPart] = value.split(".");
  if (!ivPart || !tagPart || !encryptedPart) throw new Error("Invalid encrypted secret format");

  const iv = Buffer.from(ivPart, "base64url");
  const authTag = Buffer.from(tagPart, "base64url");
  const encrypted = Buffer.from(encryptedPart, "base64url");
  if (iv.length !== 12 || authTag.length !== 16 || encrypted.length === 0) {
    throw new Error("Invalid encrypted secret payload");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
