import { addDays, format, parseISO } from "date-fns";

import { supabase } from "../lib/supabaseClient";
import { logActivity } from "./activity.js";

function splitLines(value) {
  if (Array.isArray(value)) {
    return value.map((s) => String(s).trim()).filter(Boolean);
  }

  return String(value || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitTags(value) {
  if (Array.isArray(value)) {
    return value.map((s) => String(s).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function deadlineParts(deadlineInput) {
  const now = new Date();

  if (
    typeof deadlineInput === "number" &&
    Number.isFinite(deadlineInput)
  ) {
    const date = addDays(now, deadlineInput);

    return {
      deadlineDate: date.toISOString(),
      deadline: format(date, "d MMM yyyy"),
    };
  }

  const raw = String(deadlineInput || "").trim();

  if (!raw) {
    const date = addDays(now, 30);

    return {
      deadlineDate: date.toISOString(),
      deadline: format(date, "d MMM yyyy"),
    };
  }

  try {
    const date = parseISO(raw);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    return {
      deadlineDate: date.toISOString(),
      deadline: format(date, "d MMM yyyy"),
    };
  } catch {
    const date = addDays(now, 30);

    return {
      deadlineDate: date.toISOString(),
      deadline: format(date, "d MMM yyyy"),
    };
  }
}

function mapChallenge(row) {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    category: row.category,
    location: row.location || "",
    budget: row.budget || "",
    duration: row.duration || "",
    featured: Boolean(row.featured),
    description: row.description || "",

    requirements: Array.isArray(row.requirements)
      ? row.requirements
      : splitLines(row.requirements),

    tags: Array.isArray(row.tags)
      ? row.tags
      : splitTags(row.tags),

    matchKeywords: Array.isArray(row.match_keywords)
      ? row.match_keywords
      : splitTags(row.match_keywords),

    eligibility: row.eligibility || {
      stages: ["Idea", "MVP", "Early Revenue", "Growth"],
      needsDPIIT: false,
      minTeam: 2,
      note: "",
    },

    deadline: row.deadline_date
      ? new Date(row.deadline_date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "",

    deadlineDate: row.deadline_date || null,
    postedDate: row.posted_date || row.created_at || null,
    status: row.status || "Open",

    createdBy: row.created_by || null,
    createdByName: row.created_by_name || "",

    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,

    govCreated: Boolean(row.gov_created),
  };
}

export function validateChallengeInput(input = {}) {
  const errors = {};

  if (!String(input.title || "").trim()) {
    errors.title = "Title is required.";
  }

  if (!String(input.department || "").trim()) {
    errors.department = "Department is required.";
  }

  if (!String(input.category || "").trim()) {
    errors.category = "Category is required.";
  }

  if (!String(input.description || "").trim()) {
    errors.description = "Description is required.";
  }

  if (
    !String(input.deadlineInput || input.deadlineDate || "").trim()
  ) {
    errors.deadlineInput = "Application deadline is required.";
  }

  return errors;
}

/* =========================
   LIST GOVERNMENT CHALLENGES
========================= */

export async function listGovChallenges() {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading government challenges:", error);
    throw new Error(error.message);
  }

  return (data || []).map(mapChallenge);
}

/* =========================
   GET CHALLENGE BY ID
========================= */

export async function getGovChallengeById(id) {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    console.error("Error loading challenge:", error);
    throw new Error(error.message);
  }

  return mapChallenge(data);
}

/* =========================
   GET CHALLENGES BY OWNER
========================= */

export async function getGovChallengesByOwner(govUserId) {
  if (!govUserId) {
    return [];
  }

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("created_by", govUserId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading owned challenges:", error);
    throw new Error(error.message);
  }

  return (data || []).map(mapChallenge);
}

/* =========================
   CREATE CHALLENGE
========================= */

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
  if (!govUserId) {
    throw new Error("Not authenticated");
  }

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

  const { deadlineDate: iso } = deadlineParts(
    deadlineInput || deadlineDate
  );

  const nowISO = new Date().toISOString();

  const record = {
    title: String(title).trim(),

    department: String(department).trim(),

    category: String(category).trim(),

    location:
      String(location || "").trim() || "Pan-India",

    budget:
      String(budget || "").trim() || "Pilot grant (TBD)",

    duration:
      String(duration || "").trim() || "6-month pilot",

    featured: false,

    description: String(description).trim(),

    requirements: splitLines(requirements),

    tags: splitTags(tags),

    match_keywords: splitTags(tags),

    eligibility: {
      stages: [
        "Idea",
        "MVP",
        "Early Revenue",
        "Growth",
      ],

      needsDPIIT: false,

      minTeam: 2,

      note:
        String(eligibilityNote || "").trim() ||
        "Open to DPIIT-recognised and early-stage startups.",
    },

    deadline_date: iso,

    posted_date: nowISO,

    status: "Open",

    created_by: govUserId,

    created_by_name: govDisplayName || "",

    created_at: nowISO,

    updated_at: nowISO,

    gov_created: true,
  };

  console.log(
    "CHALLENGE RECORD BEING SENT:",
    record
  );

  const { data, error } = await supabase
    .from("challenges")
    .insert(record)
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error creating challenge:",
      error
    );

    throw new Error(error.message);
  }

  const mapped = mapChallenge(data);

  await logActivity(
    govUserId,
    "challenge_created",
    `Published challenge: ${mapped.title}`,
    {
      challengeId: mapped.id,
    }
  ).catch(() => {});

  return mapped;
}

/* =========================
   UPDATE CHALLENGE
========================= */

export async function updateChallenge(
  id,
  govUserId,
  patch = {}
) {
  if (!govUserId) {
    throw new Error("Not authenticated");
  }

  const { data: currentRow, error: findError } =
    await supabase
      .from("challenges")
      .select("*")
      .eq("id", id)
      .single();

  if (findError || !currentRow) {
    throw new Error("Challenge not found");
  }

  if (
    currentRow.created_by &&
    currentRow.created_by !== govUserId
  ) {
    throw new Error(
      "You can only edit challenges you created."
    );
  }

  const updateData = {};

  if (patch.title !== undefined) {
    updateData.title =
      String(patch.title).trim() ||
      currentRow.title;
  }

  if (patch.department !== undefined) {
    updateData.department =
      String(patch.department).trim() ||
      currentRow.department;
  }

  if (patch.category !== undefined) {
    updateData.category =
      String(patch.category).trim() ||
      currentRow.category;
  }

  if (patch.location !== undefined) {
    updateData.location =
      String(patch.location).trim();
  }

  if (patch.budget !== undefined) {
    updateData.budget =
      String(patch.budget).trim();
  }

  if (patch.duration !== undefined) {
    updateData.duration =
      String(patch.duration).trim();
  }

  if (patch.description !== undefined) {
    updateData.description =
      String(patch.description).trim();
  }

  if (patch.requirements !== undefined) {
    updateData.requirements =
      splitLines(patch.requirements);
  }

  if (patch.tags !== undefined) {
    const parsedTags = splitTags(patch.tags);

    updateData.tags = parsedTags;

    updateData.match_keywords = parsedTags;
  }

  if (patch.eligibilityNote !== undefined) {
    updateData.eligibility = {
      ...(currentRow.eligibility || {}),

      note: String(
        patch.eligibilityNote
      ).trim(),
    };
  }

  if (
    patch.deadlineInput ||
    patch.deadlineDate
  ) {
    const { deadlineDate: iso } =
      deadlineParts(
        patch.deadlineInput ||
          patch.deadlineDate
      );

    updateData.deadline_date = iso;
  }

  if (
    !String(
      updateData.title ?? currentRow.title
    ).trim() ||
    !String(
      updateData.department ??
        currentRow.department
    ).trim() ||
    !String(
      updateData.category ??
        currentRow.category
    ).trim() ||
    !String(
      updateData.description ??
        currentRow.description
    ).trim()
  ) {
    throw new Error(
      "Title, department, category and description are required."
    );
  }

  updateData.updated_at =
    new Date().toISOString();

  const { data, error } = await supabase
    .from("challenges")
    .update(updateData)
    .eq("id", id)
    .eq("created_by", govUserId)
    .select("*");
    

  if (error) {
    console.error(
     "Error updating challenge:",
      error
    );
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Challenge was not updated.");
  }

const mapped = mapChallenge(data[0]);
  

  await logActivity(
    govUserId,
    "challenge_updated",
    `Updated challenge: ${mapped.title}`,
    {
      challengeId: mapped.id,
    }
  ).catch(() => {});

  return mapped;
}

/* =========================
   OPEN / CLOSE CHALLENGE
========================= */

export async function setChallengeStatus(
  id,
  govUserId,
  status
) {
  if (!govUserId) {
    throw new Error("Not authenticated");
  }

  const normalized =
    status === "Closed"
      ? "Closed"
      : "Open";

  const { data, error } = await supabase
    .from("challenges")
    .update({
      status: normalized,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", govUserId)
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error changing challenge status:",
      error
    );

    throw new Error(error.message);
  }

  const mapped = mapChallenge(data);

  await logActivity(
    govUserId,
    normalized === "Closed"
      ? "challenge_closed"
      : "challenge_reopened",
    `${
      normalized === "Closed"
        ? "Closed"
        : "Reopened"
    } challenge: ${mapped.title}`,
    {
      challengeId: mapped.id,
    }
  ).catch(() => {});

  return mapped;
}

/* =========================
   DELETE CHALLENGE
========================= */

export async function deleteChallenge(
  id,
  govUserId
) {
  if (!govUserId) {
    throw new Error("Not authenticated");
  }

  const { data: target, error: findError } =
    await supabase
      .from("challenges")
      .select("*")
      .eq("id", id)
      .single();

  if (findError || !target) {
    throw new Error("Challenge not found");
  }

  if (
    target.created_by &&
    target.created_by !== govUserId
  ) {
    throw new Error(
      "You can only delete challenges you created."
    );
  }

  const { error } = await supabase
    .from("challenges")
    .delete()
    .eq("id", id)
    .eq("created_by", govUserId);

  if (error) {
    console.error(
      "Error deleting challenge:",
      error
    );

    throw new Error(error.message);
  }

  await logActivity(
    govUserId,
    "challenge_deleted",
    `Deleted challenge: ${target.title}`,
    {
      challengeId: target.id,
    }
  ).catch(() => {});

  return true;
}