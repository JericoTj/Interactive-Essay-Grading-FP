import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export type JwtPayload = {
  userId: number;
  role: "STUDENT" | "INSTRUCTOR";
};

export function verifyToken(req: NextRequest): JwtPayload | null {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  try {
    const token = auth.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}

export function requireRole(req: NextRequest, role: "INSTRUCTOR" | "STUDENT") {
  const user = verifyToken(req);
  if (!user) return { error: "Unauthorized", status: 401 };
  if (user.role !== role) return { error: "Forbidden", status: 403 };
  return { user };
}

// ── Client-side helpers (browser only) ──────────────────────────────
export function getUser(): JwtPayload | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function saveUser(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}