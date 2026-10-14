import { GeneratedDeckResult } from "@/lib/ai/deck-generator";
import {
  generateTopicsForPair,
  generateDeckForTopic,
  generateReinforcementDeck,
  CurriculumTopic,
  WeakCard,
} from "@/lib/ai/curriculum";
import { isOpenRouterConfigured } from "@/lib/ai/openrouter";
import {
  createDeckWithCards,
  countSharedDecksForPair,
  getSharedDeckTitles,
  getExistingCardFronts,
  deduplicateSharedAiDecks,
  getUserDecks,
  getUserWeakCards,
  countUserAiDecksSince,
  DeckItem,
} from "@/lib/data/decks";
import {
  buildAiTemplateMeta,
  findCachedPayload,
  saveCachedPayload,
} from "@/lib/data/ai-deck-cache";
import { hashContent } from "@/lib/utils/hash";
import { canonicalForm } from "@/lib/utils/translit";
import { normalizePairKey } from "@/lib/utils/language";

/**
 * Automatic content pipeline (shared templates + personal reinforcement decks).
 *
 * Layer 1/2 — shared curriculum: AI generates starter decks ONCE per language pair
 * (is_starter = true, shared by every user of that pair). Idempotent via content_hash
 * and capped at TARGET_SHARED_DECKS_PER_PAIR so random AI topics can't flood the DB.
 *
 * Layer 3 — personal top-up: if the user is running low on due cards OR keeps failing
 * certain cards, generate a personal reinforcement deck. Max 1 per user per day.
 *
 * All generation goes through OpenRouter (MiMo by default); every step degrades
 * gracefully when the API is unavailable.
 */

/** Max shared decks generated in a single pipeline run (keeps latency bounded). */
const MAX_SHARED_DECKS_PER_RUN = 3;
/** Hard cap of shared AI decks per language pair — stops unbounded growth. */
export const TARGET_SHARED_DECKS_PER_PAIR = 12;
/** Target number of due cards a learner should have "in the bank". */
const DUE_TARGET = 15;
/** Max personal AI decks per user per day (budget guard). */
const MAX_PERSONAL_AI_DECKS_PER_DAY = 1;

/**
 * Cache-aware topic map generation: when the same curriculum request was
 * answered before, the stored topic map is reused — zero AI calls.
 */
async function getOrGenerateTopics(
  native: string,
  target: string,
  count: number,
  excludeTitles: string[] = []
): Promise<CurriculumTopic[]> {
  // Cache key includes the covered themes so new topics are generated when
  // the curriculum already contains some decks
  const subject = `curriculum-map:${hashContent([...excludeTitles].sort().join("|"))}`;
  const meta = buildAiTemplateMeta("topics", native, target, count, subject);
  const cached = await findCachedPayload<CurriculumTopic[]>(meta.request_hash);
  if (cached && cached.length > 0) return cached;

  const topics = await generateTopicsForPair(native, target, count, excludeTitles);
  if (topics.length > 0) await saveCachedPayload(meta, topics);
  return topics;
}

/** Result of a cache-aware generation: the deck and where it came from. */
interface GeneratedSource {
  deck: GeneratedDeckResult | null;
  fromCache: boolean;
}

/**
 * Cache-aware deck generation: an identical request (pair + level + topic)
 * returns an already generated deck from the template base instead of a real
 * AI call. Fresh misses are stored as reusable templates. When `allowAi` is
 * false (daily budget exhausted), only cached decks are served.
 */
async function getOrGenerateTopicDeck(
  topic: CurriculumTopic,
  native: string,
  target: string,
  allowAi = true
): Promise<GeneratedSource> {
  const meta = buildAiTemplateMeta("deck", native, target, topic.level, topic.title);
  const cached = await findCachedPayload<GeneratedDeckResult>(meta.request_hash);
  if (cached && Array.isArray(cached.cards) && cached.cards.length > 0) {
    return {
      deck: {
        ...cached,
        deck_name: cached.deck_name || topic.title,
        description: cached.description || topic.description,
        target_language: target,
        level: topic.level,
      },
      fromCache: true,
    };
  }
  if (!allowAi) return { deck: null, fromCache: false };

  const deck = await generateDeckForTopic(topic, native, target);
  if (deck && deck.cards.length > 0) await saveCachedPayload(meta, deck);
  return { deck, fromCache: false };
}

/** Cache-aware reinforcement deck generation (keyed by the weak words set). */
async function getOrGenerateReinforcementDeck(
  weakCards: WeakCard[],
  native: string,
  target: string,
  level: number,
  allowAi = true
): Promise<GeneratedSource> {
  const subject =
    "reinforce:" +
    weakCards
      .map((c) => c.front.trim().toLowerCase())
      .sort()
      .join("|");
  const meta = buildAiTemplateMeta("deck", native, target, level, subject);
  const cached = await findCachedPayload<GeneratedDeckResult>(meta.request_hash);
  if (cached && Array.isArray(cached.cards) && cached.cards.length > 0) {
    return { deck: { ...cached, target_language: target, level }, fromCache: true };
  }
  if (!allowAi) return { deck: null, fromCache: false };

  const deck = await generateReinforcementDeck(weakCards, native, target, level);
  if (deck && deck.cards.length > 0) await saveCachedPayload(meta, deck);
  return { deck, fromCache: false };
}

function sharedContentHash(native: string, target: string, topic: CurriculumTopic): string {
  return `curriculum:${normalizePairKey(`${native}-${target}`)}:lvl${topic.level}:${hashContent(
    topic.title.toLowerCase().trim()
  )}`;
}

function personalContentHash(userId: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return `personal:${userId}:${day}`;
}

/**
 * Ensures shared (is_starter) curriculum decks exist for a language pair.
 * Idempotent: decks whose content_hash already exists are skipped.
 */
export async function ensureSharedCurriculum(params: {
  userId: string;
  native: string;
  target: string;
}): Promise<{ created: number; skipped: number }> {
  const { userId, native, target } = params;

  // Never generate content for native English speakers (en-ru, en-uz)
  if (native.toLowerCase() === "en") {
    return { created: 0, skipped: 0 };
  }

  if (!userId || !isOpenRouterConfigured()) {
    return { created: 0, skipped: 0 };
  }

  // Collapse AI decks that heavily duplicate older decks of the pair
  // (e.g. three decks all teaching pronouns)
  const pairKey = normalizePairKey(`${native}-${target}`);
  try {
    const removed = await deduplicateSharedAiDecks(pairKey);
    if (removed.length > 0) {
      console.log("Dedup: removed overlapping shared decks:", removed.join(" | "));
    }
  } catch (err) {
    console.warn("Shared deck dedup failed:", err);
  }

  // Stop when the pair already has enough shared decks — random AI topics
  // must not flood the database on every visit
  const existingCount = await countSharedDecksForPair(pairKey);
  if (existingCount >= TARGET_SHARED_DECKS_PER_PAIR) {
    return { created: 0, skipped: existingCount };
  }

  // Already covered themes are passed to the AI so it proposes NEW topics
  const coveredTitles = await getSharedDeckTitles(pairKey);
  const topics = await getOrGenerateTopics(
    native,
    target,
    Math.min(6, TARGET_SHARED_DECKS_PER_PAIR - existingCount + 1),
    coveredTitles
  );
  let created = 0;
  let skipped = 0;

  for (const topic of topics) {
    if (created >= MAX_SHARED_DECKS_PER_RUN) break;

    const contentHash = sharedContentHash(native, target, topic);

    const { deck: deckData } = await getOrGenerateTopicDeck(topic, native, target);
    if (!deckData || deckData.cards.length === 0) {
      skipped++;
      continue;
    }

    // Drop cards already taught by other decks of the pair
    const existingFronts = await getExistingCardFronts(userId, pairKey);
    const freshCards = (deckData.cards || []).filter(
      (c) => !existingFronts.has(canonicalForm(String(c.front)))
    );
    if (freshCards.length < 5) {
      skipped++;
      continue;
    }
    const cleanedDeck: GeneratedDeckResult = { ...deckData, cards: freshCards };

    const result = await createDeckWithCards(userId, cleanedDeck, native, {
      is_starter: true,
      source: "ai",
      content_hash: contentHash,
      level: topic.level,
      // Dedup guard: skip if a deck with this content_hash already exists
      skip_if_exists: true,
    });

    if (result.created) created++;
    else skipped++;
  }

  return { created, skipped };
}

/**
 * Personal top-up: generates a reinforcement deck when the user is low on due
 * cards or keeps struggling with certain material. Idempotent per day.
 */
export async function topUpPersonalDecks(params: {
  userId: string;
  native: string;
  target: string;
}): Promise<{ created: boolean; reason: string }> {
  const { userId, native, target } = params;

  // Never generate content for native English speakers (en-ru, en-uz)
  if (native.toLowerCase() === "en") {
    return { created: false, reason: "not_supported_pair" };
  }

  // Budget gates only REAL AI calls: decks served from the template base
  // (ai_deck_templates) cost nothing and never consume the daily limit.
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const aiToday = await countUserAiDecksSince(userId, startOfDay.toISOString());
  const underBudget = aiToday < MAX_PERSONAL_AI_DECKS_PER_DAY;
  const allowAi = underBudget && isOpenRouterConfigured();

  // 2. Assess load: total due cards across the user's pair-scoped decks
  const decks: DeckItem[] = await getUserDecks(userId, normalizePairKey(`${native}-${target}`));
  const totalDue = decks.reduce((acc, d) => acc + d.due_cards, 0);

  const deckIds = decks.map((d) => d.id);
  const weakCards: WeakCard[] = await getUserWeakCards(deckIds, 8);

  const lowOnCards = totalDue < DUE_TARGET;
  const struggling = weakCards.length >= 3;

  if (!lowOnCards && !struggling) {
    return { created: false, reason: "enough_material" };
  }

  // 3. Generate (or reuse) the deck: cache hits bypass the budget entirely
  const generated = struggling
    ? await getOrGenerateReinforcementDeck(weakCards, native, target, 1, allowAi)
    : await generateFreshTopicDeck(native, target, decks, allowAi);
  const deckData = generated.deck;

  if (!deckData || deckData.cards.length === 0) {
    return {
      created: false,
      reason: !isOpenRouterConfigured()
        ? "ai_unavailable"
        : underBudget
        ? "generation_failed"
        : "daily_budget_exhausted",
    };
  }

  // Skip cards already taught by other decks of the pair
  const pairKey = normalizePairKey(`${native}-${target}`);
  const existingFronts = await getExistingCardFronts(userId, pairKey);
  const freshCards = (deckData.cards || []).filter(
    (c) => !existingFronts.has(canonicalForm(String(c.front)))
  );
  const usableDeck: GeneratedDeckResult =
    freshCards.length >= 3 ? { ...deckData, cards: freshCards } : deckData;

  const result = await createDeckWithCards(userId, usableDeck, native, {
    is_starter: false,
    // Cache-sourced decks don't count toward the AI spend budget
    source: generated.fromCache ? "ai_cache" : "ai",
    content_hash: personalContentHash(userId),
    level: deckData.level || 1,
    skip_if_exists: true,
  });

  return result.created
    ? { created: true, reason: struggling ? "reinforcement" : "top_up" }
    : { created: false, reason: "already_generated_today" };
}

/**
 * Picks a curriculum topic the user hasn't studied yet and generates a deck for it.
 */
async function generateFreshTopicDeck(
  native: string,
  target: string,
  existingDecks: DeckItem[],
  allowAi = true
): Promise<GeneratedSource> {
  const topics = await getOrGenerateTopics(
    native,
    target,
    6,
    existingDecks.map((d) => d.title)
  );
  const usedTitles = new Set(existingDecks.map((d) => d.title.toLowerCase().trim()));

  const freshTopic = topics.find((t) => !usedTitles.has(t.title.toLowerCase().trim()));
  if (!freshTopic) return { deck: null, fromCache: false };

  return getOrGenerateTopicDeck(freshTopic, native, target, allowAi);
}
