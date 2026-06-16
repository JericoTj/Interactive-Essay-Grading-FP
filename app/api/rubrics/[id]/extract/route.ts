import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth-server";
import { r2 } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { extractText } from "@/lib/extract";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rubric = await prisma.rubric.findUnique({ where: { id: parseInt(id) } });
    if (!rubric) return NextResponse.json({ error: "Rubric not found" }, { status: 404 });
    if (!rubric.fileKey) return NextResponse.json({ error: "No file attached to rubric" }, { status: 400 });

    // Download from R2
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: rubric.fileKey,
    });

    const response = await r2.send(command);
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Detect mime type from file extension
    const ext = rubric.fileName?.split(".").pop()?.toLowerCase();
    const mimeType = ext === "pdf"
      ? "application/pdf"
      : ext === "docx"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "text/plain";

    const text = await extractText(buffer, mimeType);
    return NextResponse.json({ text, name: rubric.name });

  } catch (error) {
    console.error("EXTRACT ERROR:", error);
    return NextResponse.json({ error: "Failed to extract rubric text" }, { status: 500 });
  }
}