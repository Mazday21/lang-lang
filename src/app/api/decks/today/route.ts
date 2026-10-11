import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { getTodayDeckCards } from "@/lib/data/decks";
import { getUserProgress } from "@/lib/data/user-progress";
import { getUserLanguages } from "@/lib/data/decks";
import { normalizePairKey } from "@/lib/utils/language";

export const dynamic = "force-dynamic";

const TARGET_NAMES: Record<string, string> = {
  ru: "русский",
  uz: "узбекский",
  en: "английский",
  it: "итальянский",
};

/**
 * GET /api/decks/today — "Колода на сегодня": a mixed session of real cards
 * from the user's decks of the current language pair, distributed by difficulty:
 * 60% of the user's level, 20% above, 20% below (with documented edge cases).
 * Cards are real (SM-2 reviews work as usual).
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

    // The user's difficulty level follows the same rule as the hub's recommendation
    const progress = await getUserProgress(userId);
    const userLevel = Math.min(5, Math.max(1, Math.floor(progress.proficiency_level / 2) + 1));

    const result = await getTodayDeckCards(userId, pairKey, userLevel);
    const targetCode = pairKey.split("-")[1] || "uz";

    return NextResponse.json({
      success: true,
      deck: {
        id: "today",
        title: "Колода на сегодня",
        description: "Перемешанные карты из ваших колод под ваш уровень сложности",
        target_language: TARGET_NAMES[targetCode] || "узбекский",
      },
      cards: result.cards,
      distribution: result.distribution,
      user_level: result.user_level,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to build today's deck";
    console.error("GET /api/decks/today error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
