import { getJSON, setJSON, delay, uid } from "./mockDb.js";
import { ACTIVITY_KEY } from "./mockDb.js";

// Simple per-user activity feed. Types: signup, profile_saved, draft_saved,
// submitted, withdrawn, bookmarked. UI slices render this as timeline/activity.

function scopeKey(userId) {
  return `${ACTIVITY_KEY}:${userId || "anon"}`;
}

export async function logActivity(userId, type, text, meta = {}) {
  await delay(50);
  const key = scopeKey(userId);
  const all = getJSON(key, []);
  const entry = {
    id: uid("act"),
    type,
    text,
    at: new Date().toISOString(),
    ...meta,
  };
  const next = [...all, entry].slice(-100);
  setJSON(key, next);
  return entry;
}

export async function getActivity(userId, limit = 10) {
  await delay(100);
  const all = getJSON(scopeKey(userId), []);
  return all.slice().reverse().slice(0, limit);
}

// Timeline for a single application, derived from the record (+ future status events).
export function applicationTimeline(app) {
  const events = [];
  events.push({
    id: `${app.id}-submitted`,
    label: "Application submitted",
    at: app.createdAt || app.submittedOn,
    detail: `Solution: ${app.solution || "—"}`,
  });
  if (app.document?.name) {
    events.push({
      id: `${app.id}-doc`,
      label: "Supporting document attached",
      at: app.createdAt || app.submittedOn,
      detail: app.document.name,
    });
  }
  if (app.status && app.status !== "Pending") {
    events.push({
      id: `${app.id}-status`,
      label: `Status: ${app.status}`,
      at: app.updatedAt || app.createdAt || app.submittedOn,
      detail: "Updated by department (sample)",
    });
  }
  return events;
}
