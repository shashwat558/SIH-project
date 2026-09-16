import { addDays, format, parseISO } from "date-fns";
import { KEYS, getJSON, setJSON, delay } from "./mockDb.js";
import { logActivity } from "./activity.js";

// Government-created challenges. Stored in localStorage (mock) and merged
// with the static sample list by challengeService. Keep async signatures so
// a Supabase `challenges` table is a drop-in later.
//
// Gov IDs start at 1001 to avoid colliding with static IDs 1-12.
// Existing startup code does Number(id) comparisons, so numeric IDs are kept.

const GOV_ID_FLOOR = 1001;

function allStored() {
  return getJSON(KEYS.govChallenges, []);
}

function nextGovId() {
  const all = allStored();
  const max = all.reduce((m, c) => Math.max(m, Number(c.id) || 0), GOV_ID_FLOOR - 1);
  return max + 1;
}

function splitLines(value) {
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
  return String(value || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitTags(value) {
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
  return String(value || "")
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function deadlineParts(deadlineInput) {
  // Accepts a yyyy-mm-dd date string (from <input type="date">) or a day count.
  const now = new Date();
  if (typeof deadlineInput === "number" && Number.isFinite(deadlineInput)) {
    const date = addDays(now, deadlineInput);
    return { deadlineDate: date.toISOString(), deadline: format(date, "d MMM yyyy") };
  }
  const raw = String(deadlineInput || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = parseISO(raw);
    return { deadlineDate: date.toISOString(), deadline: format(date, "d MMM yyyy") };
  }
  try {
    const date = parseISO(raw);
    return { deadlineDate: date.toISOString(), deadline: format(date, "d MMM yyyy") };
  } catch {
    const date = addDays(now, 30);
    return { deadlineDate: date.toISOString(), deadline: format(date, "d MMM yyyy") };
  }
}

export function validateChallengeInput(input = {}) {
  const errors = {};
  if (!String(input.title || "").trim()) errors.title = "Title is required.";
  if (!String(input.department || "").trim()) errors.department = "Department is required.";
  if (!String(input.category || "").trim()) errors.category = "Category is required.";
  if (!String(input.description || "").trim()) errors.description = "Description is required.";
  if (!String(input.deadlineInput || input.deadlineDate || "").trim())
    errors.deadlineInput = "Application deadline is required.";
  return errors;
}

export async function listGovChallenges() {
  await delay(150);
  return allStored();
}

export async function getGovChallengeById(id) {
  await delay(100);
  return allStored().find((c) => Number(c.id) === Number(id)) || null;
}

export async function getGovChallengesByOwner(govUserId) {
  await delay(150);
  if (!govUserId) return [];
  return allStored().filter((c) => c.createdBy === govUserId);
}

export async function createChallenge({
  govUserId,
  govDisplayName,
  title,
  department,
  category,
  location,
  budget,
  duration,
  deadlineInput,
  deadlineDate,
  description,
  requirements,
  tags,
  eligibilityNote,
}) {
  await delay(300);
  if (!govUserId) throw new Error("Not authenticated");
  const errors = validateChallengeInput({
    title,
    department,
    category,
    description,
    deadlineInput: deadlineInput || deadlineDate,
  });
  if (Object.keys(errors).length > 0) {
    throw new Error(errors[Object.keys(errors)[0]]);
  }
  const { deadline, deadlineDate: iso } = deadlineParts(deadlineInput || deadlineDate);
  const nowISO = new Date().toISOString();
  const record = {
    id: nextGovId(),
    title: String(title).trim(),
    department: String(department).trim(),
    category: String(category).trim(),
    location: String(location || "").trim() || "Pan-India",
    budget: String(budget || "").trim() || "Pilot grant (TBD)",
    duration: String(duration || "").trim() || "6-month pilot",
    featured: false,
    description: String(description).trim(),
    requirements: splitLines(requirements),
    tags: splitTags(tags),
    matchKeywords: splitTags(tags),
    eligibility: {
      stages: ["Idea", "MVP", "Early Revenue", "Growth"],
      needsDPIIT: false,
      minTeam: 2,
      note: String(eligibilityNote || "").trim() || "Open to DPIIT-recognised and early-stage startups.",
    },
    deadline,
    deadlineDate: iso,
    postedDate: nowISO,
    status: "Open",
    createdBy: govUserId,
    createdByName: govDisplayName || "",
    createdAt: nowISO,
    updatedAt: nowISO,
    govCreated: true,
  };
  const all = allStored();
  all.push(record);
  setJSON(KEYS.govChallenges, all);
  await logActivity(govUserId, "challenge_created", `Published challenge: ${record.title}`, {
    challengeId: record.id,
  }).catch(() => {});
  return record;
}

export async function updateChallenge(id, govUserId, patch = {}) {
  await delay(250);
  const all = allStored();
  const idx = all.findIndex((c) => Number(c.id) === Number(id));
  if (idx === -1) throw new Error("Challenge not found");
  const current = all[idx];
  if (current.createdBy && current.createdBy !== govUserId) {
    throw new Error("You can only edit challenges you created.");
  }
  const next = { ...current };
  if (patch.title !== undefined) next.title = String(patch.title).trim() || next.title;
  if (patch.department !== undefined) next.department = String(patch.department).trim() || next.department;
  if (patch.category !== undefined) next.category = String(patch.category).trim() || next.category;
  if (patch.location !== undefined) next.location = String(patch.location).trim();
  if (patch.budget !== undefined) next.budget = String(patch.budget).trim();
  if (patch.duration !== undefined) next.duration = String(patch.duration).trim();
  if (patch.description !== undefined) next.description = String(patch.description).trim();
  if (patch.requirements !== undefined) next.requirements = splitLines(patch.requirements);
  if (patch.tags !== undefined) {
    next.tags = splitTags(patch.tags);
    next.matchKeywords = splitTags(patch.tags);
  }
  if (patch.eligibilityNote !== undefined) {
    next.eligibility = {
      ...(next.eligibility || {}),
      note: String(patch.eligibilityNote).trim(),
    };
  }
  if (patch.deadlineInput || patch.deadlineDate) {
    const { deadline, deadlineDate: iso } = deadlineParts(
      patch.deadlineInput || patch.deadlineDate
    );
    next.deadline = deadline;
    next.deadlineDate = iso;
  }
  if (!next.title || !next.department || !next.category || !next.description) {
    throw new Error("Title, department, category and description are required.");
  }
  next.updatedAt = new Date().toISOString();
  all[idx] = next;
  setJSON(KEYS.govChallenges, all);
  await logActivity(govUserId, "challenge_updated", `Updated challenge: ${next.title}`, {
    challengeId: next.id,
  }).catch(() => {});
  return next;
}

export async function setChallengeStatus(id, govUserId, status) {
  await delay(200);
  const normalized = status === "Closed" ? "Closed" : "Open";
  const all = allStored();
  const idx = all.findIndex((c) => Number(c.id) === Number(id));
  if (idx === -1) throw new Error("Challenge not found");
  if (all[idx].createdBy && all[idx].createdBy !== govUserId) {
    throw new Error("You can only manage challenges you created.");
  }
  all[idx] = { ...all[idx], status: normalized, updatedAt: new Date().toISOString() };
  setJSON(KEYS.govChallenges, all);
  await logActivity(
    govUserId,
    normalized === "Closed" ? "challenge_closed" : "challenge_reopened",
    `${normalized === "Closed" ? "Closed" : "Reopened"} challenge: ${all[idx].title}`,
    { challengeId: all[idx].id }
  ).catch(() => {});
  return all[idx];
}

export async function deleteChallenge(id, govUserId) {
  await delay(200);
  const all = allStored();
  const target = all.find((c) => Number(c.id) === Number(id));
  if (!target) throw new Error("Challenge not found");
  if (target.createdBy && target.createdBy !== govUserId) {
    throw new Error("You can only delete challenges you created.");
  }
  setJSON(
    KEYS.govChallenges,
    all.filter((c) => Number(c.id) !== Number(id))
  );
  await logActivity(govUserId, "challenge_deleted", `Deleted challenge: ${target.title}`, {
    challengeId: target.id,
  }).catch(() => {});
  return true;
}
