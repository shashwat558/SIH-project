import { format, subDays } from "date-fns";
import { challenges } from "../data/challenges.js";
import {
  KEYS,
  getJSON,
  setJSON,
  nextApplicationId,
  seedApplications,
  ACTIVITY_KEY,
  BOOKMARKS_KEY,
  DRAFTS_KEY,
} from "./mockDb.js";
import { saveProfile } from "./startupService.js";
import { saveDraft } from "./drafts.js";
import { logActivity } from "./activity.js";

const label = (d) => format(d, "d MMM yyyy");

// One-click judge story: rich CleanTech/IoT profile (matches challenge 1 at ~90),
// three own applications across the pipeline, a half-finished draft, bookmarks.
export async function loadJudgeDemo(userId) {
  if (!userId) throw new Error("Not authenticated");

  await saveProfile(userId, {
    startupName: "Smart Waste AI",
    founderName: "Aarav Sharma",
    email: "aarav@smartwaste.in",
    phone: "+91 98200 12345",
    website: "https://smartwaste.in",
    location: "Bhopal, Madhya Pradesh",
    industry: "CleanTech",
    description:
      "We build IoT waste monitoring sensors and analytics dashboards for urban bodies — segregation tracking, collection routing and real-time sanitation monitoring.",
    stage: "MVP",
    foundedYear: "2023",
    teamSize: "6",
    dpiit: "DIPP87342",
    technology: "IoT sensors, LoRaWAN, React dashboard",
    techTags: "iot, sensors, dashboard, monitoring, analytics",
    deckLink: "https://smartwaste.in/deck",
  });

  const byId = (id) => challenges.find((c) => c.id === id);
  const mk = (challengeId, status, daysAgo, solution, extra = {}) => {
    const c = byId(challengeId);
    const at = subDays(new Date(), daysAgo);
    return {
      id: nextApplicationId(),
      userId,
      challengeId: c.id,
      challenge: c.title,
      solution,
      department: c.department,
      submittedOn: label(at),
      createdAt: at.toISOString(),
      updatedAt: at.toISOString(),
      status,
      startupName: "Smart Waste AI",
      contactPerson: "Aarav Sharma",
      solutionDescription: `${solution} — pilot-ready deployment for ${c.department}.`,
      challengeSolution: `Directly addresses "${c.title}" using our IoT + dashboard platform.`,
      expectedImpact: "Cleaner wards, lower collection cost, measurable Swachh KPIs.",
      technology: "IoT sensors, LoRaWAN, React dashboard",
      document: null,
      ...extra,
    };
  };

  const others = seedApplications().filter((a) => a.userId !== userId);
  const mine = [
    mk(2, "Pending", 1, "TrafficAI Lite"),
    mk(9, "Under Review", 6, "Grievance Triage Starter"),
    mk(5, "Approved", 20, "Offline Learning Kit"),
  ];
  setJSON(KEYS.applications, [...others, ...mine]);

  await saveDraft(userId, 1, {
    formData: {
      startupName: "Smart Waste AI",
      contactPerson: "Aarav Sharma",
      solutionTitle: "Smart Waste AI",
      solutionDescription: "IoT segregation tracking for 50 wards...",
      challengeSolution: "",
      expectedImpact: "",
      technology: "IoT sensors, dashboard",
    },
    documentName: "",
  });

  localStorage.setItem(`${BOOKMARKS_KEY}:${userId}`, JSON.stringify([1, 7]));

  const acts = [
    { days: 20, type: "submitted", text: `Applied to Digital Education Access (${mine[2].id})` },
    { days: 6, type: "submitted", text: `Applied to Grievance Triage AI Assistant (${mine[1].id})` },
    { days: 1, type: "submitted", text: `Applied to AI Based Traffic Management (${mine[0].id})` },
    { days: 0, type: "profile_saved", text: "Startup profile updated" },
  ];
  setJSON(
    `${ACTIVITY_KEY}:${userId}`,
    acts.map((a, i) => ({
      id: `demo_act_${i}`,
      type: a.type,
      text: a.text,
      at: subDays(new Date(), a.days).toISOString(),
    }))
  );
  await logActivity(userId, "submitted", "Judge demo loaded — explore the dashboard").catch(
    () => {}
  );

  return true;
}

// Remove everything the current user created; shared sample rows stay.
export async function resetDemo(userId) {
  if (!userId) throw new Error("Not authenticated");
  // Drop all applications then reseed the canonical samples (also wipes own apps).
  localStorage.removeItem(KEYS.applications);
  setJSON(KEYS.seq, 3);
  seedApplications();
  const profiles = getJSON(KEYS.profiles, {});
  delete profiles[userId];
  setJSON(KEYS.profiles, profiles);
  localStorage.removeItem(`${DRAFTS_KEY}:${userId}`);
  localStorage.removeItem(`${BOOKMARKS_KEY}:${userId}`);
  localStorage.removeItem(`${ACTIVITY_KEY}:${userId}`);
  return true;
}
