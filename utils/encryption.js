import crypto from "crypto";

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

export function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encryptedText = cipher.update(text, "utf-8", "hex");
  encryptedText += cipher.final("hex");
  return encryptedText;
}

export function decrypt(text) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decryptedText = decipher.update(text, "hex", "utf-8");
  decryptedText += decipher.final("utf-8");
  return decryptedText;
}
