import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth-server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callGroq(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });
  return completion.choices[0].message.content ?? "";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const essayId = parseInt(id);
    if (isNaN(essayId)) return NextResponse.json({ error: "Invalid essay ID" }, { status: 400 });

    const essay = await prisma.essay.findUnique({ where: { id: essayId } });
    if (!essay) return NextResponse.json({ error: "Essay not found" }, { status: 404 });

    if (user.role === "STUDENT" && essay.userId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.gradingResult.findUnique({ where: { essayId } });
    if (existing) {
      return NextResponse.json({ error: "Essay already graded", result: existing }, { status: 400 });
    }

    // Get essay content — either from DB text or extracted from file
    // Get essay content — auto-extract from file if needed
  let essayText = essay.content;
  if (!essayText.trim() && essay.fileKey) {
    try {
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

      essayText = await extractText(buffer, mimeType);

      // Cache extracted text back to DB
      await prisma.essay.update({
        where: { id: essay.id },
        data: { content: essayText },
      });
    } catch (extractError) {
      console.error("EXTRACT ERROR:", extractError);
      return NextResponse.json({ error: "Failed to extract essay text from file" }, { status: 500 });
    }
  }

  if (!essayText.trim() || essayText.trim().split(" ").length < 20) {
    return NextResponse.json({ error: "Essay is too short to grade" }, { status: 400 });
  }

    // Optional rubric text from request body
    const body = await req.json().catch(() => ({}));
    const rubricText = body.rubricText as string | undefined;

    const rubricSection = rubricText
      ? `Use the following rubric to grade the essay:\n${rubricText}\n\nBased on this rubric, determine appropriate criteria and scores.`
      : `Grade across three standard criteria: grammar, structure, and clarity.`;

    // AI FEATURE 1: Rubric-aligned scoring
    const gradingPrompt = `You are an academic essay grader. ${rubricSection}
Return ONLY valid JSON with no extra text or markdown:
{
  "overallScore": <number 0-100>,
  "overallFeedback": "<2-3 sentence overall summary>",
  "grammar": { "score": <number 0-100>, "feedback": "<specific feedback>" },
  "structure": { "score": <number 0-100>, "feedback": "<specific feedback>" },
  "clarity": { "score": <number 0-100>, "feedback": "<specific feedback>" }
}

ESSAY TITLE: ${essay.title}
ESSAY:
${essayText}`;

    // AI FEATURE 2: Grammar and style annotation
    const annotationPrompt = `You are a writing coach. Identify the 5 most important writing issues in this essay.
Return ONLY valid JSON with no extra text or markdown:
{
  "annotations": [
    {
      "sentence": "<exact sentence from the essay>",
      "issue": "<grammar|style|clarity>",
      "suggestion": "<how to improve it>"
    }
  ]
}

ESSAY:
${essayText}`;

    let gradingRaw: string, annotationRaw: string;
    try {
      [gradingRaw, annotationRaw] = await Promise.all([
        callGroq(gradingPrompt),
        callGroq(annotationPrompt),
      ]);
    } catch (groqError) {
      console.error("GROQ CALL FAILED:", groqError);
      return NextResponse.json({ error: "AI service unavailable", detail: String(groqError) }, { status: 503 });
    }

    let grading, annotations;
    try {
      grading = JSON.parse(gradingRaw);
      annotations = JSON.parse(annotationRaw);
    } catch (parseError) {
      console.error("PARSE FAILED:", parseError);
      return NextResponse.json({ error: "AI returned malformed response" }, { status: 500 });
    }

    const result = await prisma.gradingResult.create({
      data: {
        essayId: essay.id,
        overallScore: grading.overallScore,
        overallFeedback: grading.overallFeedback,
        grammarScore: grading.grammar.score,
        grammarFeedback: grading.grammar.feedback,
        structureScore: grading.structure.score,
        structureFeedback: grading.structure.feedback,
        clarityScore: grading.clarity.score,
        clarityFeedback: grading.clarity.feedback,
        annotations: JSON.stringify(annotations.annotations),
      },
    });

    return NextResponse.json(result);

  } catch (topLevelError) {
    console.error("TOP LEVEL ERROR:", topLevelError);
    return NextResponse.json({ error: "Unexpected error", detail: String(topLevelError) }, { status: 500 });
  }
}