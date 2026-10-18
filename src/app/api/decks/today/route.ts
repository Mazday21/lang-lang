import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { getTodayDeckCards, getTodayQueueCards, getUserLanguages } from "@/lib/data/decks";
import { normalizePairKey } from "@/lib/utils/language";

export const dynamic = "force-dynamic";

const TARGET_NAMES: Record<string, string> = {
  ru: "русский",
  uz: "узбекский",
  en: "английский",
  it: "итальянский",
};

/**
 * GET /api/decks/today — "Колода на сегодня": a randomly composed session of
 * real cards from the user's decks of the current language pair.
 * Cards are real (SM-2 reviews work as usual); the saved queue is reused
 * while cards remain in it.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const langs = await getUserLanguages(userId);
    const pairKey = normalizePairKey(
      searchParams.get("pair") || `${langs.native_language || "ru"}-${langs.target_language || "uz"}`
    );

    // Today's saved queue has first priority — reuse it while cards remain
    const queued = await getTodayQueueCards(userId);
    const cards = queued ?? (await getTodayDeckCards(userId, pairKey)).cards;
    const targetCode = pairKey.split("-")[1] || "uz";

    return NextResponse.json({
      success: true,
      deck: {
        id: "today",
        title: "Колода на сегодня",
        description: "Случайный микс карт из ваших колод",
        target_language: TARGET_NAMES[targetCode] || "узбекский",
      },
      cards,
      from_queue: Boolean(queued),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to build today's deck";
    console.error("GET /api/decks/today error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
