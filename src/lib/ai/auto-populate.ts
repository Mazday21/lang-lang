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
  getUserDecks,
  getUserWeakCards,
  countUserAiDecksSince,
  DeckItem,
} from "@/lib/data/decks";
import { hashContent } from "@/lib/utils/hash";
import { normalizePairKey } from "@/lib/utils/language";

/**
 * Automatic content pipeline (shared templates + personal reinforcement decks).
 *
 * Layer 1/2 — shared curriculum: AI generates starter decks ONCE per language pair
 * (is_starter = true, shared by every user of that pair). Idempotent via content_hash.
 *
 * Layer 3 — personal top-up: if the user is running low on due cards OR keeps failing
 * certain cards, generate a personal reinforcement deck. Max 1 per user per day.
 *
 * All generation goes through OpenRouter (MiMo by default); every step degrades
 * gracefully when the API is unavailable.
 */

/** Max shared decks generated in a single pipeline run (keeps latency bounded). */
const MAX_SHARED_DECKS_PER_RUN = 3;
/** Target number of due cards a learner should have "in the bank". */
const DUE_TARGET = 15;
/** Max personal AI decks per user per day (budget guard). */
const MAX_PERSONAL_AI_DECKS_PER_DAY = 1;

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

  const topics = await generateTopicsForPair(native, target, 6);
  let created = 0;
  let skipped = 0;

  for (const topic of topics) {
    if (created >= MAX_SHARED_DECKS_PER_RUN) break;

    const contentHash = sharedContentHash(native, target, topic);

    const deckData: GeneratedDeckResult | null = await generateDeckForTopic(topic, native, target);
    if (!deckData || deckData.cards.length === 0) {
      skipped++;
      continue;
    }

    const result = await createDeckWithCards(userId, deckData, native, {
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

  if (!isOpenRouterConfigured()) {
    return { created: false, reason: "ai_unavailable" };
  }

  // 1. Budget guard: max N personal AI decks per user per day
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const aiToday = await countUserAiDecksSince(userId, startOfDay.toISOString());
  if (aiToday >= MAX_PERSONAL_AI_DECKS_PER_DAY) {
    return { created: false, reason: "daily_budget_exhausted" };
  }

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

  // 3. Generate reinforcement deck (from weak cards) or fresh topic deck
  const deckData: GeneratedDeckResult | null = struggling
    ? await generateReinforcementDeck(weakCards, native, target)
    : await generateFreshTopicDeck(native, target, decks);

  if (!deckData || deckData.cards.length === 0) {
    return { created: false, reason: "generation_failed" };
  }

  const result = await createDeckWithCards(userId, deckData, native, {
    is_starter: false,
    source: "ai",
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
  existingDecks: DeckItem[]
): Promise<GeneratedDeckResult | null> {
  const topics = await generateTopicsForPair(native, target, 6);
  const usedTitles = new Set(existingDecks.map((d) => d.title.toLowerCase().trim()));

  const freshTopic = topics.find((t) => !usedTitles.has(t.title.toLowerCase().trim()));
  if (!freshTopic) return null;

  return generateDeckForTopic(freshTopic, native, target);
}
