import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { generateDeckWithAI } from "@/lib/ai/deck-generator";
import { createDeckWithCards } from "@/lib/data/decks";
import { checkAndConsumeGenerationLimit } from "@/lib/limits";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check & consume 1 AI request
    const limitCheck = await checkAndConsumeGenerationLimit(userId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          limit_exceeded: true,
          reason: limitCheck.reason || "pro_only",
          error: limitCheck.error || "Лимит AI-генераций исчерпан — оформите подписку Pro",
          limits: limitCheck,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const topic = (body.topic || "").trim();
    const nativeLang = body.native_language || "ru";
    const targetLang = body.target_language || undefined;

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Укажите тему для генерации колоды" },
        { status: 400 }
      );
    }

    const deckResult = await generateDeckWithAI(topic);
    if (targetLang) {
      deckResult.target_language = targetLang;
    }

    const createdDeck = await createDeckWithCards(userId, deckResult, nativeLang);

    return NextResponse.json({
      success: true,
      deck_id: createdDeck.id,
      deck_name: createdDeck.title,
      card_count: deckResult.cards.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate deck";
    console.error("POST /api/decks/generate error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
