/**
 * @swagger
 * /essays:
 *   get:
 *     summary: Get all essays
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of essays with grading results
 *   post:
 *     summary: Submit a new essay
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Essay created
 *       401:
 *         description: Unauthorized
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const essays = await prisma.essay.findMany({
    where: user.role === "STUDENT" ? { userId: user.userId } : undefined,
    include: { gradingResult: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(essays);
}

export async function POST(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const essay = await prisma.essay.create({
    data: { title, content, userId: user.userId },
  });

  return NextResponse.json(essay, { status: 201 });
}