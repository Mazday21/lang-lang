import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { getUserProgress, savePlacementResult } from "@/lib/data/user-progress";
import { getPlacementTest, scoreToLevel } from "@/lib/data/placement-tests";
import { normalizePairKey } from "@/lib/utils/language";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/progress
 * Returns the user's proficiency level (0..10) and placement test state.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const progress = await getUserProgress(userId);
    return NextResponse.json({ success: true, ...progress });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load progress";
    console.error("GET /api/user/progress error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/user/progress
 * Body: { pair: "ru-uz", answers: number[] } — placement test answers
 * (selected option indexes). The server scores against the question bank
 * and stores the proficiency level (0..10).
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const pairKey = normalizePairKey(String(body?.pair || ""));
    const answers = Array.isArray(body?.answers) ? body.answers.map(Number) : [];

    const test = getPlacementTest(pairKey);
    if (!test) {
      return NextResponse.json(
        { success: false, error: "Placement test not found for this pair" },
        { status: 404 }
      );
    }

    if (answers.length !== test.questions.length) {
      return NextResponse.json(
        { success: false, error: "Invalid answers count" },
        { status: 400 }
      );
    }

    // Server-side scoring against the question bank
    let score = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score++;
    });

    const level = scoreToLevel(score, test.questions.length);
    const progress = await savePlacementResult(userId, level);

    return NextResponse.json({
      success: true,
      score,
      total: test.questions.length,
      ...progress,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save placement result";
    console.error("POST /api/user/progress error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
