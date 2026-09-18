import { supabase } from "../lib/supabaseClient";
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
  if (!userId) return { ...emptyProfile };

  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { ...emptyProfile };
  }

  return {
    ...emptyProfile,
    startupName: data.startup_name || "",
    founderName: data.founder_name || "",
    email: data.email || "",
    phone: data.phone || "",
    website: data.website || "",
    location: data.location || "",
    industry: data.industry || "",
    description: data.description || "",
    stage: data.stage || "",
    foundedYear: data.founded_year || "",
    teamSize: data.team_size || "",
    dpiit: data.dpiit || "",
    technology: data.technology || "",
    techTags: data.tech_tags || "",
    deckLink: data.deck_link || "",
  };
}

export async function saveProfile(userId, data) {
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const next = { ...emptyProfile, ...data };

  const { data: savedProfile, error } = await supabase
    .from("startups")
    .upsert(
      {
        user_id: userId,
        startup_name: next.startupName,
        founder_name: next.founderName,
        email: next.email,
        phone: next.phone,
        website: next.website,
        location: next.location,
        industry: next.industry,
        description: next.description,
        stage: next.stage,
        founded_year: next.foundedYear
          ? Number(next.foundedYear)
          : null,
        team_size: next.teamSize
          ? Number(next.teamSize)
          : null,
        dpiit: next.dpiit,
        technology: next.technology,
        tech_tags: Array.isArray(next.techTags)
          ? next.techTags
          : String(next.techTags || "")
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
        deck_link: next.deckLink,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logActivity(
    userId,
    "profile_saved",
    "Startup profile updated"
  ).catch(() => {});

  return {
    ...next,
    id: savedProfile.id,
  };
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
