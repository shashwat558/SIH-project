import { getJSON, setJSON, delay } from "./mockDb.js";
import { BOOKMARKS_KEY } from "./mockDb.js";

function scopeKey(userId) {
  return `${BOOKMARKS_KEY}:${userId || "anon"}`;
}

export async function getBookmarks(userId) {
  await delay(100);
  return getJSON(scopeKey(userId), []);
}

export async function isBookmarked(userId, challengeId) {
  const list = await getBookmarks(userId);
  return list.includes(Number(challengeId));
}

export async function toggleBookmark(userId, challengeId) {
  await delay(100);
  const id = Number(challengeId);
  const list = getJSON(scopeKey(userId), []);
  const next = list.includes(id)
    ? list.filter((x) => x !== id)
    : [...list, id];
  setJSON(scopeKey(userId), next);
  return next;
}
