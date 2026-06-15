import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/r2";
import { verifyToken } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "essay" or "rubric"
    const name = formData.get("name") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOCX, and TXT files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop();
    const key = `${type ?? "file"}s/${user.userId}/${Date.now()}.${ext}`;
    const url = await uploadFile(key, buffer, file.type);

    // Save to DB
    if (type === "essay") {
      const essay = await prisma.essay.create({
        data: {
          title: name ?? file.name,
          content: "",
          fileUrl: url,
          fileKey: key,
          fileName: file.name,
          userId: user.userId,
        },
      });
      return NextResponse.json({ url, key, essayId: essay.id }, { status: 201 });
    }

    if (type === "rubric") {
      const rubric = await prisma.rubric.create({
        data: {
          name: name ?? file.name,
          fileUrl: url,
          fileKey: key,
          fileName: file.name,
          userId: user.userId,
        },
      });
      return NextResponse.json({ url, key, rubricId: rubric.id }, { status: 201 });
    }

    return NextResponse.json({ url, key }, { status: 201 });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: "Upload failed", detail: String(error) },
      { status: 500 }
    );
  }
}