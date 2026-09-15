import { profileCompletion } from "./startupService.js";

// Transparent, explainable match score (0-100) + reasons.
// Weights: industry fit 30, keyword overlap 30, profile strength 20, stage fit 10, team readiness 10.
// Missing profile fields degrade gracefully (scored 0 + surfaced as `missing[]`).

function profileText(profile) {
  return [
    profile?.industry,
    profile?.description,
    profile?.technology,
    profile?.techTags,
    profile?.startupName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function keywordHits(profile, challenge) {
  const text = profileText(profile);
  if (!text) return [];
  const keywords = challenge.matchKeywords || challenge.tags || [];
  return keywords.filter((k) => k && text.includes(String(k).toLowerCase()));
}

export function matchScore(profile, challenge) {
  const reasons = [];
  const missing = [];
  let score = 0;

  // 1. Industry fit (30)
  const industry = String(profile?.industry || "").toLowerCase();
  const category = String(challenge.category || "").toLowerCase();
  if (industry && category) {
    if (industry === category) {
      score += 30;
      reasons.push(`Industry matches (${challenge.category})`);
    } else if (
      (industry.includes("tech") && category.includes("artificial")) ||
      (industry.includes("artificial") && category.includes("tech"))
    ) {
      score += 22;
      reasons.push("Closely related field (Tech ↔ AI)");
    } else {
      score += 6;
      reasons.push("Cross-domain application possible");
    }
  } else {
    missing.push("Add your industry to improve matches");
  }

  // 2. Keyword overlap (30)
  const hits = keywordHits(profile, challenge);
  const totalKw = (challenge.matchKeywords || []).length || 1;
  const kwScore = Math.min(30, Math.round((hits.length / Math.min(totalKw, 5)) * 30));
  score += kwScore;
  if (hits.length > 0) {
    reasons.push(`Profile mentions: ${hits.slice(0, 3).join(", ")}`);
  } else {
    missing.push("Mention relevant tech/keywords in your description");
  }

  // 3. Profile strength (20)
  const completion = profileCompletion(profile || {});
  const strengthPts = Math.round((completion / 100) * 20);
  score += strengthPts;
  if (completion >= 75) reasons.push(`Strong profile (${completion}% complete)`);
  else missing.push(`Complete your profile (${completion}% → 75%+)`);

  // 4. Stage fit (10) — neutral when profile lacks stage (forward-compatible)
  const stage = String(profile?.stage || "").trim();
  const allowed = challenge.eligibility?.stages || [];
  if (!stage) {
    score += 5;
    missing.push("Add your startup stage for sharper matches");
  } else if (allowed.includes(stage)) {
    score += 10;
    reasons.push(`Stage fit (${stage})`);
  } else if (allowed.length) {
    score += 2;
    reasons.push(`Open to ${allowed.slice(0, 2).join("/")} stages — check eligibility`);
  }

  // 5. Team readiness (10) — neutral when unknown
  const team = Number(profile?.teamSize || 0);
  const minTeam = Number(challenge.eligibility?.minTeam || 0);
  if (!team) {
    score += 5;
  } else if (!minTeam || team >= minTeam) {
    score += 10;
    reasons.push(`Team size meets requirement (${team})`);
  } else {
    score += 3;
    missing.push(`Needs team of ${minTeam}+ (you have ${team})`);
  }

  return { score: Math.max(0, Math.min(100, score)), reasons, missing };
}

export function rankChallenges(profile, list) {
  return [...list]
    .map((c) => ({ challenge: c, ...matchScore(profile, c) }))
    .sort((a, b) => b.score - a.score);
}

export function topMatches(profile, list, limit = 3) {
  return rankChallenges(profile, list).slice(0, limit);
}

// Eligibility checklist evaluated from profile (used by Details slice later).
export function checkEligibility(profile, challenge) {
  const checks = [];
  const industry = String(profile?.industry || "").toLowerCase();
  const category = String(challenge.category || "").toLowerCase();
  checks.push({
    id: "industry",
    label: industry
      ? industry === category
        ? `Industry fit: ${challenge.category}`
        : "Cross-domain — allowed, explain fit in application"
      : "Add your industry",
    ok: Boolean(industry),
  });
  const completion = profileCompletion(profile || {});
  checks.push({
    id: "profile",
    label:
      completion >= 50
        ? `Profile ${completion}% complete`
        : `Profile only ${completion}% — complete it first`,
    ok: completion >= 50,
  });
  const stage = String(profile?.stage || "").trim();
  const allowed = challenge.eligibility?.stages || [];
  const stageMissing = !stage;
  const stageFit = Boolean(stage) && (allowed.length === 0 || allowed.includes(stage));
  checks.push({
    id: "stage",
    label: stageMissing
      ? "Add your startup stage (soft — you can still apply)"
      : stageFit
        ? `Stage fit: ${stage}`
        : `Prefers ${allowed.join(", ")} — you can still apply`,
    ok: stageMissing ? false : true,
    // Missing info is a soft nudge, never a hard blocker.
    warn: true,
  });
  const team = Number(profile?.teamSize || 0);
  const minTeam = Number(challenge.eligibility?.minTeam || 0);
  const teamMissing = !team;
  const teamOk = teamMissing ? false : !minTeam || team >= minTeam;
  checks.push({
    id: "team",
    label: teamMissing
      ? "Add your team size (soft — you can still apply)"
      : teamOk
        ? `Team requirement met (${team})`
        : `Needs ${minTeam}+ members (you have ${team})`,
    ok: teamMissing ? false : teamOk,
    // Missing info is a soft nudge; an undersized team is a real warning but not a block.
    warn: true,
  });
  const eligible = checks.every((c) => c.ok || c.warn);
  return { eligible, checks };
}
