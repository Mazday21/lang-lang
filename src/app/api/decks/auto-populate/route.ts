import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { getUserLanguages } from "@/lib/data/decks";
import { ensureSharedCurriculum, topUpPersonalDecks } from "@/lib/ai/auto-populate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/decks/auto-populate
 * Runs the automatic content pipeline for the current user:
 *  1. Ensures shared curriculum starter decks exist for the language pair (AI, idempotent).
 *  2. Tops up personal reinforcement decks when the user runs low on due cards
 *     or keeps failing certain material (max 1 per day).
 * Both steps are safe to call repeatedly (content_hash idempotency).
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const langs = await getUserLanguages(userId);
    const native = String(body?.native || langs.native_language || "ru").toLowerCase();
    const target = String(body?.target || langs.target_language || "uz").toLowerCase();

    // 1. Shared curriculum templates (is_starter = true, shared across users of the pair)
    const shared = await ensureSharedCurriculum({ userId, native, target });

    // 2. Personal top-up (budget-guarded, idempotent per day)
    const personal = await topUpPersonalDecks({ userId, native, target });

    return NextResponse.json({
      success: true,
      shared,
      personal,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Auto-populate failed";
    console.error("POST /api/decks/auto-populate error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
