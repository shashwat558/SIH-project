import { getJSON, setJSON, delay } from "./mockDb.js";
import { DRAFTS_KEY } from "./mockDb.js";

// Draft = autosaved apply-form per user + challenge. Shape: { data, updatedAt }.

function scopeKey(userId) {
  return `${DRAFTS_KEY}:${userId || "anon"}`;
}

export async function getDraft(userId, challengeId) {
  await delay(80);
  const all = getJSON(scopeKey(userId), {});
  return all[String(challengeId)] || null;
}

export async function saveDraft(userId, challengeId, data) {
  await delay(80);
  const key = scopeKey(userId);
  const all = getJSON(key, {});
  all[String(challengeId)] = { data, updatedAt: new Date().toISOString() };
  setJSON(key, all);
  return all[String(challengeId)];
}

export async function clearDraft(userId, challengeId) {
  await delay(80);
  const key = scopeKey(userId);
  const all = getJSON(key, {});
  delete all[String(challengeId)];
  setJSON(key, all);
  return true;
}

export async function listDrafts(userId) {
  await delay(80);
  const all = getJSON(scopeKey(userId), {});
  return Object.entries(all).map(([challengeId, v]) => ({
    challengeId: Number(challengeId),
    ...v,
  }));
}
