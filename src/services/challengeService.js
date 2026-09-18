import { challenges as sampleChallenges } from "../data/challenges.js";
import { supabase } from "../lib/supabaseClient";
import { closingSoon as closingSoonUtil, sortByDeadline } from "./deadlines.js";

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
    requirements: row.requirements || [],
    tags: row.tags || [],
    matchKeywords: row.match_keywords || [],
    eligibility: row.eligibility || {
      stages: [],
      needsDPIIT: false,
      minTeam: 0,
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

async function getSupabaseChallenges() {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading challenges from Supabase:", error);
    throw new Error(error.message);
  }

  return (data || []).map(mapChallenge);
}

async function allMerged() {
  const dbChallenges = await getSupabaseChallenges();

  // Avoid showing the same sample challenge twice
  const dbIds = new Set(dbChallenges.map((c) => Number(c.id)));

  const remainingSamples = sampleChallenges.filter(
  (c) => !dbIds.has(Number(c.id))
);

  return [...remainingSamples, ...dbChallenges];
}

export async function getChallenges() {
  return await allMerged();
}

export async function getChallengeById(id) {
  const all = await allMerged();

  return (
    all.find((c) => Number(c.id) === Number(id)) || null
  );
}

export async function getClosingSoon(withinDays = 21, limit = 5) {
  const all = await allMerged();

  return closingSoonUtil(all, withinDays, limit);
}

export async function getFeatured(limit = 3) {
  const all = await allMerged();

  return all
    .filter((c) => c.featured)
    .slice(0, limit);
}

export async function getChallengesByDeadline() {
  const all = await allMerged();

  return sortByDeadline(all);
}

export function isGovCreated(challenge) {
  return (
    Boolean(challenge?.govCreated) ||
    Number(challenge?.id) >= 1001
  );
}

export function isChallengeOpen(challenge) {
  if (!challenge) return false;

  if (challenge.status === "Closed") return false;

  return true;
}
