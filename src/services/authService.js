import { supabase } from "../lib/supabaseClient";
import { KEYS, getJSON, setJSON, uid, delay } from "./mockDb.js";
import { logActivity } from "./activity.js";

// MOCK auth only — passwords stored obfuscated, never do this in production.
// Real implementation should call Supabase Auth and never touch localStorage like this.
// Roles: 'startup' | 'government'. Legacy rows without a role default to 'startup'.

export const ROLES = {
  STARTUP: "startup",
  GOVERNMENT: "government",
};

export const GOV_DEMO = { email: "demo@gov.in", password: "password123" };
export const STARTUP_DEMO = { email: "demo@startup.in", password: "password123" };

function encode(pw) {
  try {
    return btoa(String(pw));
  } catch {
    return String(pw);
  }
}

function normalizeRole(role) {
  return role === ROLES.GOVERNMENT ? ROLES.GOVERNMENT : ROLES.STARTUP;
}

function ensureSeedUsers(users) {
  let changed = false;
  const hasGovDemo = users.some(
    (u) => u.email === GOV_DEMO.email
  );
  if (!hasGovDemo) {
    users.push({
      id: "user_gov_demo",
      role: ROLES.GOVERNMENT,
      startupName: "",
      orgName: "Urban Development Department",
      designation: "Nodal Officer",
      email: GOV_DEMO.email,
      password: encode(GOV_DEMO.password),
      createdAt: new Date().toISOString(),
    });
    changed = true;
  }
  const hasStartupDemo = users.some(
    (u) => u.email === STARTUP_DEMO.email
  );
  if (!hasStartupDemo) {
    users.push({
      id: "user_startup_demo",
      role: ROLES.STARTUP,
      startupName: "Smart Waste AI",
      email: STARTUP_DEMO.email,
      password: encode(STARTUP_DEMO.password),
      createdAt: new Date().toISOString(),
    });
    changed = true;
  }
  if (changed) setJSON(KEYS.users, users);
  return users;
}

export async function signup({
  role,
  startupName,
  orgName,
  department,
  designation,
  email,
  password,
}) {
  const normalized = String(email).trim().toLowerCase();

  const resolvedRole = normalizeRole(role);
  const isGov = resolvedRole === ROLES.GOVERNMENT;

  const displayName = isGov
    ? String(orgName || department || "").trim()
    : String(startupName || "").trim();

  if (!displayName) {
    throw new Error(
      isGov
        ? "Organisation / department is required."
        : "Startup name is required."
    );
  }

  // Create user in Supabase Authentication
  const { data, error } = await supabase.auth.signUp({
    email: normalized,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { user } = data;

  if (!user) {
    throw new Error("Signup failed.");
  }

  // Create the user's profile
  const { error: profileError } = await supabase
    .from("Profiles")
    .insert({
      id: user.id,
      role: resolvedRole,
      email: normalized,
      org_name: isGov ? displayName : null,
      department: isGov
        ? String(department || displayName).trim()
        : null,
      designation: isGov
        ? String(designation || "").trim()
        : null,
    });

  if (profileError) {
    throw new Error(profileError.message);
  }

  return publicUser({
    id: user.id,
    role: resolvedRole,
    startupName: isGov ? "" : displayName,
    orgName: isGov ? displayName : "",
    department: isGov
      ? String(department || displayName).trim()
      : "",
    designation: isGov
      ? String(designation || "").trim()
      : "",
    email: normalized,
  });
}

export async function login({ email,password }) {
  const normalized = String(email).trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  });

 if (error) {
  console.error("Supabase login error:", error);
  throw new Error(`${error.code}: ${error.message}`);
}

  const { user } = data;

  if (!user) {
    throw new Error("Login failed.");
  }

  // Get the user's profile from our database
  const { data: profile, error: profileError } = await supabase
    .from("Profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error("User profile not found.");
  }

  return publicUser({
    id: user.id,
    role: profile.role,
    startupName: profile.startup_name || "",
    orgName: profile.org_name || "",
    department: profile.department || "",
    designation: profile.designation || "",
    email: user.email,
  });
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSessionUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("Profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  return publicUser({
    id: user.id,
    role: profile.role,
    startupName: profile.startup_name || "",
    orgName: profile.org_name || "",
    department: profile.department || "",
    designation: profile.designation || "",
    email: user.email,
  });
}

export function publicUser(user) {
  if (!user) return null;
  const role = normalizeRole(user.role);
  return {
    id: user.id,
    role,
    startupName: user.startupName || "",
    // Government display fields
    orgName: user.orgName || user.department || "",
    department: user.department || user.orgName || "",
    designation: user.designation || "",
    // Convenience display name for headers/sidebars
    displayName:
      role === ROLES.GOVERNMENT
        ? user.orgName || user.department || user.email
        : user.startupName || user.email,
    email: user.email,
  };
}

export function dashboardForRole(role) {
  return normalizeRole(role) === ROLES.GOVERNMENT
    ? "/gov/dashboard"
    : "/dashboard";
}
