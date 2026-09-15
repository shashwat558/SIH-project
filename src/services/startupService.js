import { KEYS, getJSON, setJSON, delay } from "./mockDb.js";
import { logActivity } from "./activity.js";

export const emptyProfile = {
  startupName: "",
  founderName: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  industry: "",
  description: "",
  // Forward-compatible fields (profile UI upgrade lands in a later slice).
  stage: "",
  foundedYear: "",
  teamSize: "",
  dpiit: "",
  technology: "",
  techTags: "",
  deckLink: "",
};

export async function getProfile(userId) {
  await delay(150);
  if (!userId) return { ...emptyProfile };
  const all = getJSON(KEYS.profiles, {});
  return { ...emptyProfile, ...(all[userId] || {}) };
}

export async function saveProfile(userId, data) {
  await delay(250);
  if (!userId) throw new Error("Not authenticated");
  const all = getJSON(KEYS.profiles, {});
  const next = { ...emptyProfile, ...data };
  all[userId] = next;
  setJSON(KEYS.profiles, all);
  await logActivity(userId, "profile_saved", "Startup profile updated").catch(() => {});
  return next;
}

export function profileCompletion(profile) {
  // Core 8 fields — kept stable so existing dashboard % doesn't shift.
  const fields = [
    "startupName",
    "founderName",
    "email",
    "phone",
    "website",
    "location",
    "industry",
    "description",
  ];
  const filled = fields.filter((f) => String(profile?.[f] || "").trim() !== "");
  return Math.round((filled.length / fields.length) * 100);
}

// Extended strength incl. matching-relevant fields (used by copilot UI later).
export function profileStrength(profile) {
  const fields = [
    "startupName",
    "founderName",
    "email",
    "phone",
    "website",
    "location",
    "industry",
    "description",
    "stage",
    "foundedYear",
    "teamSize",
    "technology",
    "techTags",
  ];
  const filled = fields.filter((f) => String(profile?.[f] || "").trim() !== "");
  const percent = Math.round((filled.length / fields.length) * 100);
  const checklist = fields.map((f) => ({
    field: f,
    done: String(profile?.[f] || "").trim() !== "",
  }));
  return { percent, checklist };
}

export function validateDPIIT(value) {
  if (!value) return { ok: true };
  // Mock format check only (real validation is server-side).
  const ok = /^[A-Z0-9]{6,16}$/i.test(String(value).trim());
  return ok
    ? { ok: true }
    : { ok: false, error: "DPIIT number looks like 6-16 letters/digits (sample check)." };
}
