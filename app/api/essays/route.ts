/**
 * @swagger
 * /essays:
 *   get:
 *     summary: Get all essays
 *     description: Returns all essays
 *     responses:
 *       200:
 *         description: List of essays
 *
 *   post:
 *     summary: Create essay
 *     description: Saves a new essay
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               userId:
 *                 type: integer
 *               score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Essay created
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const essays = await prisma.essay.findMany({
    include: {
      user: true
    }
  });

  return NextResponse.json(essays);
}

export async function POST(req: Request) {
  const { title, content, userId, score } = await req.json();

  const essay = await prisma.essay.create({
    data: {
      title,
      content,
      userId,
      score
    }
  });

  return NextResponse.json(essay);
}