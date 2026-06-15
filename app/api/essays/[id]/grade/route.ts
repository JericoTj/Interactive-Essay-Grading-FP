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


/**
 * @swagger
 * /essays/{id}/grade:
 *   post:
 *     summary: Grade an essay using AI
 *     description: Runs two AI analyses - rubric-based scoring and grammar annotation
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
 *         description: Grading result with scores and annotations
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Essay not found
 *       503:
 *         description: AI service unavailable
 */
export async function POST(
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

    const essay = await prisma.essay.findUnique({ where: { id: essayId } });
    if (!essay) {
      return NextResponse.json({ error: "Essay not found" }, { status: 404 });
    }

    if (user.role === "STUDENT" && essay.userId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.gradingResult.findUnique({ where: { essayId } });
    if (existing) {
      return NextResponse.json({ error: "Essay already graded", result: existing }, { status: 400 });
    }

    if (essay.content.trim().split(" ").length < 20) {
      return NextResponse.json({ error: "Essay is too short to grade" }, { status: 400 });
    }

    // AI FEATURE 1: Rubric-aligned scoring
    const gradingPrompt = `You are an academic essay grader. Grade the following essay across three criteria: grammar, structure, and clarity.
Return ONLY valid JSON with no extra text or markdown code fences:
{
  "overallScore": <number 0-100>,
  "overallFeedback": "<2-3 sentence overall summary>",
  "grammar": { "score": <number 0-100>, "feedback": "<specific grammar feedback>" },
  "structure": { "score": <number 0-100>, "feedback": "<specific structure feedback>" },
  "clarity": { "score": <number 0-100>, "feedback": "<specific clarity feedback>" }
}

ESSAY TITLE: ${essay.title}
ESSAY:
${essay.content}`;

    // AI FEATURE 2: Grammar and style annotation
    const annotationPrompt = `You are a writing coach. Identify the 5 most important writing issues in this essay.
Return ONLY valid JSON with no extra text or markdown code fences:
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
${essay.content}`;

    let gradingRaw: string, annotationRaw: string;

    try {
      [gradingRaw, annotationRaw] = await Promise.all([
        callGroq(gradingPrompt),
        callGroq(annotationPrompt),
      ]);
    } catch (groqError) {
      console.error("GROQ CALL FAILED:", groqError);
      return NextResponse.json(
        { error: "AI service unavailable", detail: String(groqError) },
        { status: 503 }
      );
    }

    let grading, annotations;
    try {
      grading = JSON.parse(gradingRaw);
      annotations = JSON.parse(annotationRaw);
    } catch (parseError) {
      console.error("PARSE FAILED:", parseError);
      console.error("Raw grading:", gradingRaw);
      console.error("Raw annotations:", annotationRaw);
      return NextResponse.json(
        { error: "AI returned malformed response", detail: String(parseError) },
        { status: 500 }
      );
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
    return NextResponse.json(
      { error: "Unexpected error", detail: String(topLevelError) },
      { status: 500 }
    );
  }
}