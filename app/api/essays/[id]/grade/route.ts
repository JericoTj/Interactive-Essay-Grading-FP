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
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(30000), // 30 second timeout
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Auth check
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const essayId = parseInt(params.id);
  if (isNaN(essayId)) {
    return NextResponse.json({ error: "Invalid essay ID" }, { status: 400 });
  }

  // Get essay
  const essay = await prisma.essay.findUnique({
    where: { id: essayId },
  });

  if (!essay) {
    return NextResponse.json({ error: "Essay not found" }, { status: 404 });
  }

  // Students can only grade their own essays
  if (user.role === "STUDENT" && essay.userId !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check if already graded
  const existing = await prisma.gradingResult.findUnique({
    where: { essayId },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Essay already graded", result: existing },
      { status: 400 }
    );
  }

  // Reject suspiciously short essays
  if (essay.content.trim().split(" ").length < 20) {
    return NextResponse.json(
      { error: "Essay is too short to grade" },
      { status: 400 }
    );
  }

  try {
    // AI FEATURE 1: Rubric-aligned scoring
    const gradingPrompt = `You are an academic essay grader. Grade the following essay across three criteria: grammar, structure, and clarity.
Return ONLY valid JSON with no extra text or markdown:
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
${essay.content}`;

    // Run both AI calls in parallel
    const [gradingRaw, annotationRaw] = await Promise.all([
      callOpenAI(gradingPrompt),
      callOpenAI(annotationPrompt),
    ]);

    // Parse responses
    let grading, annotations;
    try {
      grading = JSON.parse(gradingRaw);
      annotations = JSON.parse(annotationRaw);
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed response, please try again" },
        { status: 500 }
      );
    }

    // Save to DB
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

  } catch (error: unknown) {
    // Handle timeout specifically
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        { error: "AI service timed out, please try again" },
        { status: 504 }
      );
    }
    // Handle AI unavailable
    if (error instanceof Error && error.message.includes("OpenAI error")) {
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Grading failed", detail: String(error) },
      { status: 500 }
    );
  }
}