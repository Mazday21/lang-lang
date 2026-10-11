import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { generateDeckWithAI, GeneratedDeckResult } from "@/lib/ai/deck-generator";
import {
  createDeckWithCards,
  findSimilarDecks,
  getUserLanguages,
  DeckSuggestion,
} from "@/lib/data/decks";
import { checkAndConsumeGenerationLimit } from "@/lib/limits";
import {
  buildAiTemplateMeta,
  findCachedPayload,
  saveCachedPayload,
  findSimilarTemplates,
  getTemplateById,
} from "@/lib/data/ai-deck-cache";
import { isOpenRouterConfigured } from "@/lib/ai/openrouter";
import { normalizePairKey } from "@/lib/utils/language";

/** How many semantically similar decks are offered when AI is unavailable. */
const SUGGESTION_LIMIT = 5;

/**
 * Collects the `SUGGESTION_LIMIT` decks closest to the request «по смыслу»
 * (vector search over both the template base and the user's own decks).
 */
async function collectSimilarDecks(
  userId: string,
  nativeLang: string,
  targetLang: string | undefined,
  topic: string
): Promise<DeckSuggestion[]> {
  const langs = await getUserLanguages(userId);
  const pairKey = normalizePairKey(
    `${nativeLang}-${targetLang || langs.target_language || "uz"}`
  );

  const [templates, ownDecks] = await Promise.all([
    findSimilarTemplates(topic, SUGGESTION_LIMIT),
    findSimilarDecks(userId, pairKey, topic, SUGGESTION_LIMIT),
  ]);

  return [...templates, ...ownDecks]
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, SUGGESTION_LIMIT);
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const topic = (body.topic || "").trim();
    const nativeLang = body.native_language || "ru";
    const targetLang = body.target_language || undefined;
    const templateId = body.template_id ? String(body.template_id) : null;

    // 0. Instantiating a chosen template suggestion — no AI call, no quota
    if (templateId) {
      const payload = (await getTemplateById(templateId)) as GeneratedDeckResult | null;
      if (!payload || !Array.isArray(payload.cards) || payload.cards.length === 0) {
        return NextResponse.json(
          { success: false, error: "Шаблон не найден" },
          { status: 404 }
        );
      }
      if (targetLang) payload.target_language = targetLang;
      const created = await createDeckWithCards(userId, payload, nativeLang);
      return NextResponse.json({
        success: true,
        deck_id: created.id,
        deck_name: created.title,
        card_count: payload.cards.length,
        from_template: true,
      });
    }

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Укажите тему для генерации колоды" },
        { status: 400 }
      );
    }

    // 1. Template base first: an identical request reuses an already generated
    //    deck — no real AI call, no quota consumed.
    const meta = buildAiTemplateMeta("deck", nativeLang, targetLang || "auto", 1, topic);
    let deckResult = await findCachedPayload<GeneratedDeckResult>(meta.request_hash);
    const fromCache = Boolean(deckResult);

    // 2. Cache miss → real AI call (consumes the generation quota)
    if (!deckResult && (isOpenRouterConfigured() || process.env.GEMINI_API_KEY)) {
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

      deckResult = await generateDeckWithAI(topic);
      if (deckResult) await saveCachedPayload(meta, deckResult);
    }

    // 3. AI unavailable / failed → offer the 5 closest decks by meaning
    if (!deckResult) {
      const suggestions = await collectSimilarDecks(userId, nativeLang, targetLang, topic);
      return NextResponse.json({
        success: false,
        ai_unavailable: true,
        suggestions,
        error: "ИИ временно недоступен",
      });
    }

    if (targetLang) {
      deckResult.target_language = targetLang;
    }

    const createdDeck = await createDeckWithCards(userId, deckResult, nativeLang);

    return NextResponse.json({
      success: true,
      deck_id: createdDeck.id,
      deck_name: createdDeck.title,
      card_count: deckResult.cards.length,
      from_cache: fromCache,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate deck";
    console.error("POST /api/decks/generate error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
