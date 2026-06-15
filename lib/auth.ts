import type { JwtPayload } from "@/lib/auth-server";

const KEY = "ee_token";

export function getUser(): JwtPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem(KEY);
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function saveUser(token: string): void {
  localStorage.setItem(KEY, token);
}

export function clearUser(): void {
  localStorage.removeItem(KEY);
}