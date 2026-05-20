export interface User {
  email: string;
  name: string;
  subjects: string[];
  level: string;
}

const KEY = "aristotle_user";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(KEY);
}

export function updateUser(partial: Partial<User>): void {
  const u = getUser();
  if (u) saveUser({ ...u, ...partial });
}
