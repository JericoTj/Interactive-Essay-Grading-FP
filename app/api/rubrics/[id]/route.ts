import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth-server";
import { deleteFile } from "@/lib/r2";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rubric = await prisma.rubric.findUnique({ where: { id: parseInt(id) } });
    if (!rubric) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rubric.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (rubric.fileKey) await deleteFile(rubric.fileKey);
    await prisma.rubric.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}