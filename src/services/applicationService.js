import {
  KEYS,
  setJSON,
  nextApplicationId,
  seedApplications,
  todayLabel,
  delay,
} from "./mockDb.js";
import { logActivity } from "./activity.js";
import { clearDraft } from "./drafts.js";

function allApplications() {
  return seedApplications();
}

// Visible = own submissions + demo seed rows (so a fresh account still sees the sample history).
function visibleFor(userId) {
  return allApplications().filter(
    (a) => a.userId === userId || a.userId === null
  );
}

export async function getApplications(userId) {
  await delay(250);
  return visibleFor(userId).slice().reverse();
}

export async function getRecentApplications(userId, limit = 3) {
  const apps = await getApplications(userId);
  return apps.slice(0, limit);
}

export async function getStats(userId, totalChallenges) {
  const apps = visibleFor(userId);
  const inProgress = apps.filter(
    (a) => a.status === "Pending" || a.status === "Under Review"
  ).length;
  const approved = apps.filter((a) => a.status === "Approved").length;
  return {
    available: totalChallenges,
    submitted: apps.length,
    inProgress,
    approved,
  };
}

export async function hasApplied(userId, challengeId) {
  await delay(100);
  return visibleFor(userId).some(
    (a) => Number(a.challengeId) === Number(challengeId) && a.userId === userId
  );
}

export async function submitApplication({
  userId,
  challenge,
  startupName,
  contactPerson,
  solutionTitle,
  solutionDescription,
  challengeSolution,
  expectedImpact,
  technology,
  document,
}) {
  await delay(350);
  if (!userId) throw new Error("Not authenticated");
  if (!challenge) throw new Error("Challenge not found");
  if (await hasApplied(userId, challenge.id)) {
    throw new Error("You have already applied to this challenge.");
  }
  const nowISO = new Date().toISOString();
  const record = {
    id: nextApplicationId(),
    userId,
    challengeId: challenge.id,
    challenge: challenge.title,
    solution: solutionTitle,
    department: challenge.department,
    submittedOn: todayLabel(),
    createdAt: nowISO,
    updatedAt: nowISO,
    status: "Pending",
    startupName,
    contactPerson,
    solutionDescription,
    challengeSolution,
    expectedImpact,
    technology,
    document: document
      ? { name: document.name, size: document.size, url: document.url }
      : null,
  };
  const all = allApplications();
  all.push(record);
  setJSON(KEYS.applications, all);
  await clearDraft(userId, challenge.id).catch(() => {});
  await logActivity(userId, "submitted", `Applied to ${challenge.title} (${record.id})`, {
    applicationId: record.id,
    challengeId: challenge.id,
  }).catch(() => {});
  return record;
}

export async function withdrawApplication(userId, applicationId) {
  await delay(200);
  const all = allApplications();
  const target = all.find((a) => a.id === applicationId);
  if (!target) throw new Error("Application not found");
  // Demo seeds (userId null) can be removed locally too.
  if (target.userId !== null && target.userId !== userId) {
    throw new Error("Not allowed");
  }
  setJSON(
    KEYS.applications,
    all.filter((a) => a.id !== applicationId)
  );
  await logActivity(userId, "withdrawn", `Withdrew application ${applicationId}`, {
    applicationId,
  }).catch(() => {});
  return true;
}
