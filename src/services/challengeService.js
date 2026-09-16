import { challenges } from "../data/challenges.js";
import { delay, getJSON, KEYS } from "./mockDb.js";
import { closingSoon as closingSoonUtil, sortByDeadline } from "./deadlines.js";

// Static samples + government-created challenges (localStorage mock).
// Gov records carry govCreated:true and ids >= 1001.

function govStored() {
  try {
    return getJSON(KEYS.govChallenges, []);
  } catch {
    return [];
  }
}

function allMerged() {
  return [...challenges, ...govStored()];
}

// Keep async signatures so a future Supabase implementation is a drop-in.
export async function getChallenges() {
  await delay(250);
  return allMerged();
}

export async function getChallengeById(id) {
  await delay(200);
  return allMerged().find((c) => Number(c.id) === Number(id)) || null;
}

export async function getClosingSoon(withinDays = 21, limit = 5) {
  await delay(150);
  return closingSoonUtil(allMerged(), withinDays, limit);
}

export async function getFeatured(limit = 3) {
  await delay(150);
  return allMerged().filter((c) => c.featured).slice(0, limit);
}

export async function getChallengesByDeadline() {
  await delay(150);
  return sortByDeadline(allMerged());
}

export function isGovCreated(challenge) {
  return Boolean(challenge?.govCreated) || Number(challenge?.id) >= 1001;
}

export function isChallengeOpen(challenge) {
  if (!challenge) return false;
  if (challenge.status === "Closed") return false;
  return true;
}
