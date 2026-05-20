// Auth module — Supabase sessions + localStorage fast cache
// localStorage is populated on login and updated on profile changes.
// Supabase is the source of truth for identity and profile metadata.

import { createClient } from "./supabase/client";

export interface User {
  id?: string;
  email: string;
  name: string;
  subjects: string[];
  level: string;
}

const KEY = "aristotle_user";

/* ── localStorage cache (fast, synchronous) ── */

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(KEY);
    return s ? (JSON.parse(s) as User) : null;
  } catch { return null; }
}

export function saveUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function updateUser(partial: Partial<User>): void {
  const u = getUser();
  if (!u) return;
  const updated = { ...u, ...partial };
  saveUser(updated);
  // Sync profile data to Supabase metadata (fire-and-forget)
  if (typeof window !== "undefined") {
    const supabase = createClient();
    supabase.auth.updateUser({ data: partial }).catch(() => {});
  }
}

/* ── Supabase session helpers (async) ── */

/** Pull the Supabase session, populate localStorage, return User. */
export async function syncUserFromSession(): Promise<User | null> {
  if (typeof window === "undefined") return null;
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const profile: User = {
      id:       user.id,
      email:    user.email!,
      name:     user.user_metadata?.name     || user.email!.split("@")[0],
      subjects: user.user_metadata?.subjects || [],
      level:    user.user_metadata?.level    || "Beginner",
    };
    saveUser(profile);
    return profile;
  } catch { return null; }
}

/** Sign out from Supabase and clear localStorage. */
export async function signOut(): Promise<void> {
  clearUser();
  if (typeof window === "undefined") return;
  const supabase = createClient();
  await supabase.auth.signOut();
}
