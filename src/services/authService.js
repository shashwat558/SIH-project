import { KEYS, getJSON, setJSON, uid, delay } from "./mockDb.js";
import { logActivity } from "./activity.js";

// MOCK auth only — passwords stored obfuscated, never do this in production.
// Real implementation should call Supabase Auth and never touch localStorage like this.
function encode(pw) {
  try {
    return btoa(String(pw));
  } catch {
    return String(pw);
  }
}

export async function signup({ startupName, email, password }) {
  await delay(300);
  const users = getJSON(KEYS.users, []);
  const normalized = String(email).trim().toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    throw new Error("An account with this email already exists.");
  }
  const user = {
    id: uid("user"),
    startupName: startupName.trim(),
    email: normalized,
    password: encode(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  setJSON(KEYS.users, users);
  const session = { userId: user.id, email: user.email };
  setJSON(KEYS.session, session);
  await logActivity(user.id, "signup", `Account created for ${user.startupName}`).catch(() => {});
  return publicUser(user);
}

export async function login({ email, password }) {
  await delay(300);
  const users = getJSON(KEYS.users, []);
  const normalized = String(email).trim().toLowerCase();
  const user = users.find((u) => u.email === normalized);
  if (!user || user.password !== encode(password)) {
    throw new Error("Invalid email or password.");
  }
  setJSON(KEYS.session, { userId: user.id, email: user.email });
  return publicUser(user);
}

export async function logout() {
  await delay(100);
  localStorage.removeItem(KEYS.session);
}

export async function getSessionUser() {
  await delay(100);
  const session = getJSON(KEYS.session, null);
  if (!session?.userId) return null;
  const users = getJSON(KEYS.users, []);
  const user = users.find((u) => u.id === session.userId);
  return user ? publicUser(user) : null;
}

export function publicUser(user) {
  if (!user) return null;
  return { id: user.id, startupName: user.startupName, email: user.email };
}
