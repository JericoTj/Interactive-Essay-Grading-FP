import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const essayId = parseInt(id);
    if (isNaN(essayId)) {
      return NextResponse.json({ error: "Invalid essay ID" }, { status: 400 });
    }

    const essay = await prisma.essay.findUnique({
      where: { id: essayId },
      include: {
        gradingResult: true,
        user: { select: { name: true, email: true, role: true } },
      },
    });

    if (!essay) {
      return NextResponse.json({ error: "Essay not found" }, { status: 404 });
    }

    // Students can only see their own essays
    if (user.role === "STUDENT" && essay.userId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(essay);

  } catch (error) {
    console.error("GET ESSAY ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch essay" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const essayId = parseInt(id);
    if (isNaN(essayId)) {
      return NextResponse.json({ error: "Invalid essay ID" }, { status: 400 });
    }

    const essay = await prisma.essay.findUnique({ where: { id: essayId } });
    if (!essay) {
      return NextResponse.json({ error: "Essay not found" }, { status: 404 });
    }

    // Delete grading result first if exists
    await prisma.gradingResult.deleteMany({ where: { essayId } });
    await prisma.essay.delete({ where: { id: essayId } });

    return NextResponse.json({ message: "Essay deleted" });

  } catch (error) {
    console.error("DELETE ESSAY ERROR:", error);
    return NextResponse.json({ error: "Failed to delete essay" }, { status: 500 });
  }
}