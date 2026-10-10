import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { getUserProgress, savePlacementResult } from "@/lib/data/user-progress";
import { getPlacementTest, scoreToLevel } from "@/lib/data/placement-tests";
import { normalizePairKey } from "@/lib/utils/language";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/progress
 * Returns the user's dynamic proficiency level (0..10): base level (placement test
 * or manual choice) plus gradual growth from mastered cards, placement test state
 * and study statistics.
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
 * POST /api/user/progress — three modes:
 *  1) Placement test:   { pair: "ru-uz", answers: number[] } (server-side scoring)
 *  2) Manual selection: { level: 0..10 }
 *  3) Skip the test:    { skip: true } (keeps the current base level)
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // 3) Skip: mark the test as done, keep the current base level
    if (body?.skip === true) {
      const current = await getUserProgress(userId);
      await savePlacementResult(userId, current.base_level);
      const progress = await getUserProgress(userId);
      return NextResponse.json({ success: true, mode: "skip", ...progress });
    }

    // 2) Manual level selection
    if (body?.level !== undefined && body?.level !== null) {
      const level = Number(body.level);
      if (!Number.isFinite(level) || level < 0 || level > 10) {
        return NextResponse.json(
          { success: false, error: "Invalid level. Must be 0..10" },
          { status: 400 }
        );
      }
      await savePlacementResult(userId, level);
      const progress = await getUserProgress(userId);
      return NextResponse.json({ success: true, mode: "manual", ...progress });
    }

    // 1) Placement test with server-side scoring against the question bank
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

    let score = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score++;
    });

    const level = scoreToLevel(score, test.questions.length);
    await savePlacementResult(userId, level);
    const progress = await getUserProgress(userId);

    return NextResponse.json({
      success: true,
      mode: "test",
      score,
      total: test.questions.length,
      ...progress,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save progress";
    console.error("POST /api/user/progress error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
