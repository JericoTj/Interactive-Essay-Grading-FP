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
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const essay = await prisma.essay.findUnique({ where: { id: parseInt(id) } });
    if (!essay) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (user.role === "STUDENT" && essay.userId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If we already have content return it
    if (essay.content.trim()) {
      return NextResponse.json({ content: essay.content, fileName: essay.fileName });
    }

    // Extract from R2
    if (essay.fileKey) {
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const { r2 } = await import("@/lib/r2");
      const { extractText } = await import("@/lib/extract");

      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: essay.fileKey,
      });

      const response = await r2.send(command);
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const ext = essay.fileName?.split(".").pop()?.toLowerCase();
      const mimeType = ext === "pdf"
        ? "application/pdf"
        : ext === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "text/plain";

      const content = await extractText(buffer, mimeType);

      // Cache it
      await prisma.essay.update({ where: { id: essay.id }, data: { content } });

      return NextResponse.json({ content, fileName: essay.fileName });
    }

    return NextResponse.json({ error: "No content available" }, { status: 404 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to get content" }, { status: 500 });
  }
}