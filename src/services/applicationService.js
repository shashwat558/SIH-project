import { supabase } from "../lib/supabaseClient";
import { logActivity } from "./activity.js";
import { clearDraft } from "./drafts.js";

export const APPLICATION_STATUSES = [
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
];

export const REVIEW_TRANSITIONS = {
  Pending: ["Under Review", "Approved", "Rejected"],
  "Under Review": ["Approved", "Rejected", "Pending"],
  Approved: ["Under Review", "Rejected"],
  Rejected: ["Under Review", "Pending"],
};

function mapApplication(row) {
  return {
    id: row.id,
    userId: row.user_id,
    startupId: row.startup_id,
    challengeId: row.challenge_id,
    challenge: row.challenge_title || "",
    solution: row.solution_title || "",
    department: row.department || "",
    submittedOn: row.submitted_at
      ? new Date(row.submitted_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    startupName: row.startup_name,
    contactPerson: row.contact_person || "",
    solutionDescription: row.solution_description || "",
    challengeSolution: row.challenge_solution || "",
    expectedImpact: row.expected_impact || "",
    technology: row.technology || "",
    document: row.document_name
      ? {
          name: row.document_name,
          size: row.document_size,
          type: row.document_type,
          path: row.document_path,
        }
      : null,
    reviewNote: row.review_note || "",
    reviewedBy: row.reviewed_by || null,
    reviewedAt: row.reviewed_at || null,
  };
}

async function getChallengeDetails(challengeId) {
  const { data, error } = await supabase
    .from("challenges")
    .select("id, title, department")
    .eq("id", challengeId)
    .single();

  if (error) {
    throw new Error(`Challenge not found: ${error.message}`);
  }

  return data;
}

export async function getApplications(userId) {
  if (!userId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      challenges (
        title,
        department
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading applications:", error);
    throw new Error(error.message);
  }

  return (data || []).map((row) =>
    mapApplication({
      ...row,
      challenge_title: row.challenges?.title || "",
      department: row.challenges?.department || "",
    })
  );
}

export async function getRecentApplications(userId, limit = 3) {
  const apps = await getApplications(userId);
  return apps.slice(0, limit);
}

export async function getStats(userId, totalChallenges) {
  const apps = await getApplications(userId);

  const inProgress = apps.filter(
    (a) => a.status === "Pending" || a.status === "Under Review"
  ).length;

  const approved = apps.filter(
    (a) => a.status === "Approved"
  ).length;

  return {
    available: totalChallenges,
    submitted: apps.length,
    inProgress,
    approved,
  };
}

export async function hasApplied(userId, challengeId) {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .maybeSingle();

  if (error) {
    console.error("Error checking application:", error);
    throw new Error(error.message);
  }

  return Boolean(data);
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
  if (!userId) throw new Error("Not authenticated");
  if (!challenge) throw new Error("Challenge not found");

  const alreadyApplied = await hasApplied(userId, challenge.id);

  if (alreadyApplied) {
    throw new Error("You have already applied to this challenge.");
  }

  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  const applicationId = `APP-${Date.now()}`;

  const record = {
    id: applicationId,
    user_id: userId,
    startup_id: startup?.id || null,
    challenge_id: challenge.id,
    startup_name: startupName,
    contact_person: contactPerson,
    solution_title: solutionTitle,
    solution_description: solutionDescription,
    challenge_solution: challengeSolution,
    expected_impact: expectedImpact,
    technology,
    document_name: document?.name || null,
    document_size: document?.size || null,
    document_type: document?.type || null,
    document_path: document?.path || document?.url || null,
    status: "Pending",
    submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("applications")
    .insert(record)
    .select("*")
    .single();

  if (error) {
    console.error("Error submitting application:", error);
    throw new Error(error.message);
  }

  await clearDraft(userId, challenge.id).catch(() => {});

  await logActivity(
    userId,
    "submitted",
    `Applied to ${challenge.title} (${applicationId})`,
    {
      applicationId,
      challengeId: challenge.id,
    }
  ).catch(() => {});

  return mapApplication({
    ...data,
    challenge_title: challenge.title,
    department: challenge.department,
  });
}

export async function withdrawApplication(userId, applicationId) {
  if (!userId) throw new Error("Not authenticated");

  const { data: application, error: findError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .single();

  if (findError || !application) {
    throw new Error("Application not found");
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error withdrawing application:", error);
    throw new Error(error.message);
  }

  await logActivity(
    userId,
    "withdrawn",
    `Withdrew application ${applicationId}`,
    {
      applicationId,
    }
  ).catch(() => {});

  return true;
}

export async function getApplicationsForGov() {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      challenges (
        title,
        department,
        created_by
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading government applications:", error);
    throw new Error(error.message);
  }

  return (data || []).map((row) =>
    mapApplication({
      ...row,
      challenge_title: row.challenges?.title || "",
      department: row.challenges?.department || "",
    })
  );
}

export async function getGovStats() {
  const applications = await getApplicationsForGov();

  const by = (status) =>
    applications.filter((a) => a.status === status).length;

  return {
    total: applications.length,
    pending: by("Pending"),
    underReview: by("Under Review"),
    approved: by("Approved"),
    rejected: by("Rejected"),
    inProgress: by("Pending") + by("Under Review"),
  };
}

export async function updateApplicationStatus({
  reviewerId,
  applicationId,
  status,
  note,
}) {
  if (!reviewerId) throw new Error("Not authenticated");

  if (!APPLICATION_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const { data: existing, error: findError } = await supabase
    .from("applications")
    .select(`
      *,
      challenges (
        title,
        department,
        created_by
      )
    `)
    .eq("id", applicationId)
    .single();

  if (findError || !existing) {
    throw new Error("Application not found");
  }

  const nowISO = new Date().toISOString();

  const { data, error } = await supabase
    .from("applications")
    .update({
      status,
      review_note: String(note || "").trim(),
      reviewed_by: reviewerId,
      reviewed_at: nowISO,
      updated_at: nowISO,
    })
    .eq("id", applicationId)
    .select(`
      *,
      challenges (
        title,
        department,
        created_by
      )
    `)
    .single();

  if (error) {
    console.error("Error updating application status:", error);
    throw new Error(error.message);
  }

  const mapped = mapApplication({
    ...data,
    challenge_title: data.challenges?.title || "",
    department: data.challenges?.department || "",
  });

  await logActivity(
    reviewerId,
    "reviewed",
    `${status}: ${mapped.challenge} (${mapped.id})`,
    {
      applicationId: mapped.id,
      challengeId: mapped.challengeId,
      status,
    }
  ).catch(() => {});

  if (mapped.userId) {
    await logActivity(
      mapped.userId,
      "status_changed",
      `Your application ${mapped.id} is now ${status}`,
      {
        applicationId: mapped.id,
        challengeId: mapped.challengeId,
        status,
      }
    ).catch(() => {});
  }

  return mapped;
}
