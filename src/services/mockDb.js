// Tiny localStorage-backed mock DB. Swap internals for Supabase later;
// keep the exported function shapes stable.

const KEYS = {
  users: "s2g_users",
  session: "s2g_session",
  profiles: "s2g_profiles",
  applications: "s2g_applications",
  seq: "s2g_app_seq",
  bookmarks: "s2g_bookmarks",
  drafts: "s2g_drafts",
  activity: "s2g_activity",
};

// Scoped keys (suffixed per user by services).
export const BOOKMARKS_KEY = KEYS.bookmarks;
export const DRAFTS_KEY = KEYS.drafts;
export const ACTIVITY_KEY = KEYS.activity;

export function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function nextApplicationId() {
  const current = getJSON(KEYS.seq, 3);
  const next = current + 1;
  setJSON(KEYS.seq, next);
  return `APP-${String(next).padStart(3, "0")}`;
}

export function seedApplications() {
  // Seed the 3 sample applications once, attached to no user (visible to demo user until real data exists).
  // Real user submissions are stored with userId; seeds have userId: null and are shown for demo.
  const existing = getJSON(KEYS.applications, null);
  if (existing !== null) return existing;
  const seed = [
    {
      id: "APP-001",
      userId: null,
      challengeId: 1,
      challenge: "Smart City Waste Management",
      solution: "Smart Waste AI",
      department: "Urban Development Department",
      submittedOn: "10 Sep 2026",
      status: "Under Review",
    },
    {
      id: "APP-002",
      userId: null,
      challengeId: 2,
      challenge: "Digital Healthcare Platform",
      solution: "HealthConnect",
      department: "Health Department",
      submittedOn: "5 Sep 2026",
      status: "Approved",
    },
    {
      id: "APP-003",
      userId: null,
      challengeId: 3,
      challenge: "AI Based Traffic Management",
      solution: "TrafficAI",
      department: "Transport Department",
      submittedOn: "2 Sep 2026",
      status: "Pending",
    },
  ];
  setJSON(KEYS.applications, seed);
  setJSON(KEYS.seq, 3);
  return seed;
}

export function todayLabel() {
  const d = new Date();
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const delay = (ms = 250) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export { KEYS };
