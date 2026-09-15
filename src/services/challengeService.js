import { challenges } from "../data/challenges.js";
import { delay } from "./mockDb.js";
import { closingSoon as closingSoonUtil, sortByDeadline } from "./deadlines.js";

// Keep async signatures so a future Supabase implementation is a drop-in.
export async function getChallenges() {
  await delay(250);
  return challenges;
}

export async function getChallengeById(id) {
  await delay(200);
  return challenges.find((c) => c.id === Number(id)) || null;
}

export async function getClosingSoon(withinDays = 21, limit = 5) {
  await delay(150);
  return closingSoonUtil(challenges, withinDays, limit);
}

export async function getFeatured(limit = 3) {
  await delay(150);
  return challenges.filter((c) => c.featured).slice(0, limit);
}

export async function getChallengesByDeadline() {
  await delay(150);
  return sortByDeadline(challenges);
}
