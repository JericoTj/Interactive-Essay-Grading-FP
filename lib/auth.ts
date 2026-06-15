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