import { delay } from "./mockDb.js";

const ACCEPTED = [".pdf", ".doc", ".docx"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB demo limit

export function validateFile(file) {
  if (!file) return { ok: true };
  const name = file.name || "";
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  if (!ACCEPTED.includes(ext)) {
    return { ok: false, error: "Only PDF, DOC or DOCX files are allowed." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File must be smaller than 5MB (demo limit)." };
  }
  return { ok: true };
}

// Mock upload: returns metadata only. Real Supabase version would upload
// to a storage bucket and return the path/URL.
export async function mockUploadDocument(userId, file) {
  await delay(300);
  if (!file) return null;
  const check = validateFile(file);
  if (!check.ok) throw new Error(check.error);
  return {
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    // Fake URL keeps UI working without a backend.
    url: `mock://documents/${userId || "demo"}/${encodeURIComponent(file.name)}`,
  };
}
