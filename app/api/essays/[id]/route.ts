/**
 * @swagger
 * /essays/{id}:
 *   get:
 *     summary: Get essay with grading result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Essay with grading result if available
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Essay not found
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const essay = await prisma.essay.findUnique({
    where: { id: parseInt(params.id) },
    include: { gradingResult: true, user: { select: { name: true, email: true } } },
  });

  if (!essay) {
    return NextResponse.json({ error: "Essay not found" }, { status: 404 });
  }

  // Students can only see their own essays
  if (user.role === "STUDENT" && essay.userId !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(essay);
}