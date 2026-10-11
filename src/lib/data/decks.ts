import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { calculateSM2, SM2Grade } from "@/lib/sm2";
import { STARTER_DECKS, SEED_DECKS } from "@/lib/data/seed-data";
import { GeneratedDeckResult } from "@/lib/ai/deck-generator";
import {
  detectLanguageFromText,
  isDeckMatchingPair,
  extractDirectedLangTokens,
  normalizePairKey,
} from "@/lib/utils/language";
import { computeMixShares, snapToAvailableLevel } from "@/lib/utils/today-mix";

export const MAX_SESSION_CARDS = 20;

export interface DeckItem {
  id: string;
  title: string;
  description: string | null;
  native_language?: string;
  target_language: string;
  language_pair?: string;
  level: number;
  is_starter?: boolean;
  is_dynamic: boolean;
  total_cards: number;
  due_cards: number;
}

export interface CardItem {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  rule_description: string | null;
  interval: number;
  repetitions: number;
  ease_factor: number;
  next_review_at: string;
}

// In-memory fallback for local dev mode when Supabase is not configured
interface MockStore {
  seededUsers: Set<string>;
  userLanguages: Map<string, { native: string; target: string }>;
  decks: Map<
    string,
    {
      id: string;
      user_id: string;
      title: string;
      description: string;
      native_language: string;
      target_language: string;
      language_pair: string;
      level?: number;
      is_starter: boolean;
      is_dynamic: boolean;
      source?: string;
      content_hash?: string | null;
      created_at?: string;
    }
  >;
  cards: Map<
    string,
    {
      id: string;
      user_id: string;
      deck_id: string;
      front: string;
      back: string;
      rule_description: string;
      interval: number;
      repetitions: number;
      ease_factor: number;
      next_review_at: string;
    }
  >;
}

const mockStore: MockStore = {
  seededUsers: new Set(),
  userLanguages: new Map(),
  decks: new Map(),
  cards: new Map(),
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Seeds starter decks for a specific language pair (e.g. ru-uz, ru-en, uz-ru, uz-en).
 * Idempotent backfill: decks whose title already exists for the pair are skipped,
 * so newly added themes appear for existing users too. Returns the number of decks created.
 */
export async function seedStarterDecksForPair(
  userId: string,
  nativeLang: string,
  targetLang: string
): Promise<number> {
  const pairKey = `${nativeLang}-${targetLang}`.toLowerCase();
  const decksToSeed = STARTER_DECKS[pairKey] || STARTER_DECKS["ru-uz"];
  const knownTitles = new Set<string>();
  let seededCount = 0;

  if (!isSupabaseConfigured()) {
    mockStore.seededUsers.add(userId);
    for (const d of Array.from(mockStore.decks.values())) {
      if ((d.user_id === userId || d.is_starter) && isDeckMatchingPair(d, pairKey)) {
        knownTitles.add(d.title.trim().toLowerCase());
      }
    }
    for (const seedDeck of decksToSeed) {
      const titleKey = seedDeck.title.trim().toLowerCase();
      if (knownTitles.has(titleKey)) continue;
      knownTitles.add(titleKey);
      const deckId = `deck-${pairKey}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      mockStore.decks.set(deckId, {
        id: deckId,
        user_id: userId,
        title: seedDeck.title,
        description: seedDeck.description,
        native_language: nativeLang,
        target_language: targetLang,
        language_pair: pairKey,
        level: seedDeck.level || 1,
        is_starter: true,
        is_dynamic: true,
        created_at: new Date().toISOString(),
      });

      let cardIdx = 1;
      for (const seedCard of seedDeck.cards) {
        const cardId = `card-${deckId}-${cardIdx++}`;
        mockStore.cards.set(cardId, {
          id: cardId,
          user_id: userId,
          deck_id: deckId,
          front: seedCard.front,
          back: seedCard.back,
          rule_description: seedCard.rule_description,
          interval: 0,
          repetitions: 0,
          ease_factor: 2.5,
          next_review_at: new Date(Date.now() - 60000).toISOString(),
        });
      }
      seededCount++;
    }
    return seededCount;
  }

  const supabase = getSupabaseAdminClient();

  const { data: existingRows } = await supabase
    .from("decks")
    .select("title")
    .eq("language_pair", pairKey)
    .or(`user_id.eq.${userId},is_starter.eq.true`);
  for (const row of existingRows || []) {
    knownTitles.add(String(row.title || "").trim().toLowerCase());
  }

  for (const seedDeck of decksToSeed) {
    const titleKey = seedDeck.title.trim().toLowerCase();
    if (knownTitles.has(titleKey)) continue;
    knownTitles.add(titleKey);
    const baseDeckInsert = {
      user_id: userId,
      title: seedDeck.title,
      description: seedDeck.description,
      native_language: nativeLang,
      target_language: targetLang,
      language_pair: pairKey,
    };

    let deckId: string | null = null;

    // Try full insert first (with level + is_starter)
    const { data: deck, error: deckErr } = await supabase
      .from("decks")
      .insert({
        ...baseDeckInsert,
        level: seedDeck.level || 1,
        is_starter: true,
        is_dynamic: true,
      })
      .select("id")
      .single();

    if (!deckErr && deck) {
      deckId = deck.id;
    } else {
      // If is_starter column is missing, retry without it
      const fallbackInsert = await supabase
        .from("decks")
        .insert({
          ...baseDeckInsert,
          level: seedDeck.level || 1,
          is_dynamic: true,
        })
        .select("id")
        .single();

      if (!fallbackInsert.error && fallbackInsert.data) {
        deckId = fallbackInsert.data.id;
      } else {
        // If level column is missing too, retry with legacy schema
        const legacyInsert = await supabase
          .from("decks")
          .insert({
            ...baseDeckInsert,
            is_dynamic: true,
          })
          .select("id")
          .single();

        if (legacyInsert.error || !legacyInsert.data) {
          console.error("Failed to seed starter deck:", legacyInsert.error);
          continue;
        }
        deckId = legacyInsert.data.id;
      }
    }

    const cardsToInsert = seedDeck.cards.map((c) => ({
      user_id: userId,
      deck_id: deckId,
      front: c.front,
      back: c.back,
      rule_description: c.rule_description,
      interval: 0,
      repetitions: 0,
      ease_factor: 2.5,
      next_review_at: new Date().toISOString(),
    }));

    const { error: cardsErr } = await supabase.from("cards").insert(cardsToInsert);
    if (cardsErr) {
      console.error("Failed to seed cards:", cardsErr);
    }
    seededCount++;
  }

  return seededCount;
}

/**
 * Updates user languages and ensures starter decks exist for that pair.
 */
export async function updateUserLanguages(
  userId: string,
  nativeLang: string,
  targetLang: string
): Promise<{ native_language: string; target_language: string }> {
  if (!isSupabaseConfigured()) {
    mockStore.userLanguages.set(userId, { native: nativeLang, target: targetLang });
    // Idempotent backfill: adds missing starter decks (including new themes)
    await seedStarterDecksForPair(userId, nativeLang, targetLang);
    return { native_language: nativeLang, target_language: targetLang };
  }

  const supabase = getSupabaseAdminClient();
  await supabase
    .from("users")
    .update({
      native_language: nativeLang,
      target_language: targetLang,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // Idempotent backfill: adds missing starter decks (including new themes)
  await seedStarterDecksForPair(userId, nativeLang, targetLang);

  return { native_language: nativeLang, target_language: targetLang };
}

/**
 * Gets user language preferences
 */
export async function getUserLanguages(
  userId: string
): Promise<{ native_language: string | null; target_language: string | null }> {
  if (!isSupabaseConfigured()) {
    const mock = mockStore.userLanguages.get(userId);
    return {
      native_language: mock?.native || null,
      target_language: mock?.target || null,
    };
  }

  const supabase = getSupabaseAdminClient();
  const { data: user } = await supabase
    .from("users")
    .select("native_language, target_language")
    .eq("id", userId)
    .single();

  return {
    native_language: user?.native_language || null,
    target_language: user?.target_language || null,
  };
}

/**
 * Fallback ensureSeeded for legacy calls
 */
export async function ensureUserSeeded(userId: string): Promise<void> {
  const langs = await getUserLanguages(userId);
  const native = langs.native_language || "ru";
  const target = langs.target_language || "uz";
  await seedStarterDecksForPair(userId, native, target);
}

/**
 * Returns decks for the user with count of due cards (next_review_at <= now).
 * Returns user decks PLUS system starter decks (is_starter = true).
 * Applies soft language pair filtering.
 */
export async function getUserDecks(
  userId: string,
  pairFilter?: string
): Promise<DeckItem[]> {
  const nowIso = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    let userDecks = Array.from(mockStore.decks.values()).filter(
      (d) => d.user_id === userId || d.is_starter
    );

    if (pairFilter) {
      const filtered = userDecks.filter((d) => isDeckMatchingPair(d, pairFilter));
      if (filtered.length > 0) {
        userDecks = filtered;
      }
    }

    const allCards = Array.from(mockStore.cards.values()).filter(
      (c) => c.user_id === userId || userDecks.some((d) => d.id === c.deck_id)
    );

    // ORDER BY level ASC, created_at ASC
    userDecks.sort((a, b) => {
      const levelDiff = (a.level || 1) - (b.level || 1);
      if (levelDiff !== 0) return levelDiff;
      return (a.created_at || "").localeCompare(b.created_at || "");
    });

    return userDecks.map((d) => {
      const deckCards = allCards.filter((c) => c.deck_id === d.id);
      const dueCards = deckCards.filter((c) => c.next_review_at <= nowIso);
      return {
        id: d.id,
        title: d.title,
        description: d.description,
        native_language: d.native_language || "ru",
        target_language: d.target_language || detectLanguageFromText(d.title),
        language_pair: d.language_pair,
        level: d.level || 1,
        is_starter: Boolean(d.is_starter),
        is_dynamic: d.is_dynamic ?? true,
        total_cards: deckCards.length,
        due_cards: dueCards.length,
      };
    });
  }

  const supabase = getSupabaseAdminClient();

  let decks: Array<any> | null = null;
  let decksErr: any = null;

  // Try querying user decks PLUS system starter decks (is_starter = true)
  try {
    const res = await supabase
      .from("decks")
      .select("id, title, description, native_language, target_language, language_pair, level, is_dynamic, is_starter, user_id, created_at")
      .or(`user_id.eq.${userId},is_starter.eq.true`)
      .order("level", { ascending: true })
      .order("created_at", { ascending: true });
    decks = res.data;
    decksErr = res.error;
  } catch (err) {
    decksErr = err;
  }

  // Fallback if is_starter/level columns are not present in existing table
  if (decksErr || !decks) {
    const resFallback = await supabase
      .from("decks")
      .select("id, title, description, native_language, target_language, language_pair, is_dynamic, user_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    decks = resFallback.data;
    decksErr = resFallback.error;
  }

  if (decksErr || !decks) {
    console.error("Failed to fetch decks from Supabase:", decksErr);
    return [];
  }

  // Strict language pair filtering
  let matchedDecks = pairFilter
    ? decks.filter((deck) => isDeckMatchingPair(deck, pairFilter))
    : decks;

  // Idempotent backfill: auto-seed missing starter decks for this pair (new themes appear for existing users)
  if (pairFilter) {
    const tokens = extractDirectedLangTokens(pairFilter);
    const native = tokens[0] || "ru";
    const target = tokens[1] || "uz";
    try {
      const seeded = await seedStarterDecksForPair(userId, native, target);
      if (seeded > 0) {
        let reseeded: any = await supabase
          .from("decks")
          .select("id, title, description, native_language, target_language, language_pair, level, is_dynamic, is_starter, user_id, created_at")
          .or(`user_id.eq.${userId},is_starter.eq.true`)
          .order("level", { ascending: true })
          .order("created_at", { ascending: true });
        if (reseeded.error || !reseeded.data) {
          reseeded = await supabase
            .from("decks")
            .select("id, title, description, native_language, target_language, language_pair, is_dynamic, is_starter, user_id, created_at")
            .or(`user_id.eq.${userId},is_starter.eq.true`)
            .order("created_at", { ascending: true });
        }
        if (reseeded.data && reseeded.data.length > 0) {
          matchedDecks = reseeded.data.filter((deck: any) => isDeckMatchingPair(deck, pairFilter));
        }
      }
    } catch (seedErr) {
      console.warn("Could not re-seed on empty query:", seedErr);
    }
  }

  // Fetch cards for matched decks
  const deckIds = matchedDecks.map((d) => d.id);
  let cards: Array<any> | null = null;
  if (deckIds.length > 0) {
    const { data: cardsRes } = await supabase
      .from("cards")
      .select("id, deck_id, next_review_at")
      .in("deck_id", deckIds);
    cards = cardsRes;
  }

  // ORDER BY level ASC, created_at ASC (safety net for legacy fallback queries)
  matchedDecks = [...matchedDecks].sort((a, b) => {
    const levelDiff = (a.level || 1) - (b.level || 1);
    if (levelDiff !== 0) return levelDiff;
    return (a.created_at || "").localeCompare(b.created_at || "");
  });

  return matchedDecks.map((deck) => {
    const deckCards = (cards || []).filter((c) => c.deck_id === deck.id);
    const dueCards = deckCards.filter((c) => c.next_review_at <= nowIso);
    return {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      native_language: deck.native_language || "ru",
      target_language: deck.target_language || detectLanguageFromText(deck.title),
      language_pair: deck.language_pair,
      level: deck.level || 1,
      is_starter: Boolean(deck.is_starter),
      is_dynamic: deck.is_dynamic ?? true,
      total_cards: deckCards.length,
      due_cards: dueCards.length,
    };
  });
}

/**
 * Returns cards for review in a specific deck.
 * Supports both user decks and starter decks.
 */
export async function getDeckCards(
  userId: string,
  deckId: string
): Promise<{
  deck: {
    id: string;
    title: string;
    description: string | null;
    native_language?: string;
    target_language?: string;
    language_pair?: string;
    level?: number;
    is_starter?: boolean;
    is_dynamic?: boolean;
  };
  cards: CardItem[];
}> {
  const nowIso = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const deck = mockStore.decks.get(deckId);
    if (!deck || (deck.user_id !== userId && !deck.is_starter)) {
      throw new Error("Deck not found");
    }

    const deckCards = Array.from(mockStore.cards.values()).filter(
      (c) => c.deck_id === deckId
    );

    let trainingCards = deckCards.filter((c) => c.next_review_at <= nowIso);
    if (trainingCards.length === 0) {
      trainingCards = [...deckCards];
    }
    trainingCards = trainingCards.slice(0, MAX_SESSION_CARDS);

    return {
      deck: {
        id: deck.id,
        title: deck.title,
        description: deck.description,
        native_language: deck.native_language,
        target_language: deck.target_language || detectLanguageFromText(deck.title),
        language_pair: deck.language_pair,
        level: deck.level || 1,
        is_starter: deck.is_starter,
        is_dynamic: deck.is_dynamic ?? true,
      },
      cards: trainingCards,
    };
  }

  const supabase = getSupabaseAdminClient();

  let deckRes = await supabase
    .from("decks")
    .select("id, title, description, native_language, target_language, language_pair, level, is_dynamic, is_starter, user_id")
    .eq("id", deckId)
    .or(`user_id.eq.${userId},is_starter.eq.true`)
    .maybeSingle();

  if (!deckRes.data) {
    deckRes = await supabase
      .from("decks")
      .select("id, title, description, native_language, target_language, language_pair, is_dynamic, user_id")
      .eq("id", deckId)
      .maybeSingle();
  }

  const deck = deckRes.data;
  if (!deck) {
    throw new Error("Deck not found");
  }

  const { data: dueCards, error: dueErr } = await supabase
    .from("cards")
    .select("id, deck_id, front, back, rule_description, interval, repetitions, ease_factor, next_review_at")
    .eq("deck_id", deckId)
    .lte("next_review_at", nowIso)
    .order("next_review_at", { ascending: true })
    .limit(MAX_SESSION_CARDS);

  if (dueErr) throw new Error(dueErr.message);

  let cards = dueCards || [];

  if (cards.length === 0) {
    const { data: allCards, error: allErr } = await supabase
      .from("cards")
      .select("id, deck_id, front, back, rule_description, interval, repetitions, ease_factor, next_review_at")
      .eq("deck_id", deckId)
      .order("next_review_at", { ascending: true })
      .limit(MAX_SESSION_CARDS);

    if (allErr) throw new Error(allErr.message);
    cards = allCards || [];
  }

  cards = cards.slice(0, MAX_SESSION_CARDS);

  return {
    deck: {
      ...deck,
      level: deck.level ?? 1,
      target_language: deck.target_language || detectLanguageFromText(deck.title),
    },
    cards,
  };
}

/**
 * Options for automatic/controlled deck creation (content pipeline).
 */
export interface CreateDeckOptions {
  is_starter?: boolean;
  source?: "ai" | "user" | "seed";
  content_hash?: string | null;
  level?: number;
  /** When true, an existing deck with the same content_hash is returned instead of inserting. */
  skip_if_exists?: boolean;
}

/**
 * Finds a deck id by its idempotency content_hash (returns null when absent).
 */
export async function findDeckIdByContentHash(contentHash: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    for (const deck of Array.from(mockStore.decks.values())) {
      if (deck.content_hash === contentHash) return deck.id;
    }
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("decks")
    .select("id")
    .eq("content_hash", contentHash)
    .maybeSingle();

  return data?.id || null;
}

/**
 * Creates a brand new deck with generated cards.
 * Supports the content pipeline: shared starter templates (is_starter),
 * personal decks, difficulty level and idempotency via content_hash.
 */
export async function createDeckWithCards(
  userId: string,
  deckData: GeneratedDeckResult,
  nativeLang = "ru",
  options: CreateDeckOptions = {}
): Promise<{ id: string; title: string; created: boolean }> {
  const language = deckData.target_language || detectLanguageFromText(deckData.deck_name);
  const pairKey = `${nativeLang}-${language}`.toLowerCase();
  const isStarter = options.is_starter ?? false;
  const source = options.source ?? "user";
  const contentHash = options.content_hash ?? null;
  const level = options.level || deckData.level || 1;

  // Idempotency guard: never create duplicates of generated content
  if (contentHash && options.skip_if_exists) {
    const existingId = await findDeckIdByContentHash(contentHash);
    if (existingId) {
      return { id: existingId, title: deckData.deck_name, created: false };
    }
  }

  if (!isSupabaseConfigured()) {
    mockStore.seededUsers.add(userId);
    const deckId = `deck-ai-${Date.now()}`;
    mockStore.decks.set(deckId, {
      id: deckId,
      user_id: userId,
      title: deckData.deck_name,
      description: deckData.description,
      native_language: nativeLang,
      target_language: language,
      language_pair: pairKey,
      level,
      is_starter: isStarter,
      is_dynamic: true,
      source,
      content_hash: contentHash,
      created_at: new Date().toISOString(),
    });

    let cardIdx = 1;
    for (const card of deckData.cards) {
      const cardId = `card-ai-${Date.now()}-${cardIdx++}`;
      mockStore.cards.set(cardId, {
        id: cardId,
        user_id: userId,
        deck_id: deckId,
        front: card.front,
        back: card.back,
        rule_description: card.rule_description,
        interval: 0,
        repetitions: 0,
        ease_factor: 2.5,
        next_review_at: new Date().toISOString(),
      });
    }

    return { id: deckId, title: deckData.deck_name, created: true };
  }

  const supabase = getSupabaseAdminClient();

  const baseDeckInsert = {
    user_id: userId,
    title: deckData.deck_name,
    description: deckData.description,
    native_language: nativeLang,
    target_language: language,
    language_pair: pairKey,
    is_dynamic: true,
  };

  // Try insert with level + is_starter + source + content_hash first
  let { data: newDeck, error: deckErr } = await supabase
    .from("decks")
    .insert({
      ...baseDeckInsert,
      level,
      is_starter: isStarter,
      source,
      content_hash: contentHash,
    })
    .select("id, title")
    .single();

  if (deckErr || !newDeck) {
    // Fallback: legacy tables without source/content_hash columns
    const midInsert = await supabase
      .from("decks")
      .insert({
        ...baseDeckInsert,
        level,
        is_starter: isStarter,
      })
      .select("id, title")
      .single();
    newDeck = midInsert.data;
    deckErr = midInsert.error;
  }

  if (deckErr || !newDeck) {
    // Fallback for legacy tables without level/is_starter columns
    const fallbackInsert = await supabase
      .from("decks")
      .insert(baseDeckInsert)
      .select("id, title")
      .single();
    newDeck = fallbackInsert.data;
    deckErr = fallbackInsert.error;
  }

  if (deckErr || !newDeck) {
    throw new Error(deckErr?.message || "Failed to create deck");
  }

  const cardsToInsert = deckData.cards.map((c) => ({
    user_id: userId,
    deck_id: newDeck.id,
    front: c.front,
    back: c.back,
    rule_description: c.rule_description,
    interval: 0,
    repetitions: 0,
    ease_factor: 2.5,
    next_review_at: new Date().toISOString(),
  }));

  const { error: cardsErr } = await supabase.from("cards").insert(cardsToInsert);
  if (cardsErr) {
    console.error("Failed to insert generated cards:", cardsErr);
  }

  return { id: newDeck.id, title: newDeck.title, created: true };
}

/**
 * Returns the user's "weak" cards (ease_factor below threshold) inside the given decks.
 * Used by the personal top-up pipeline to generate reinforcement material.
 * Note: shared starter deck cards belong to their creator, so no user_id filter here —
 * visibility is already scoped by the deck list.
 */
export async function getUserWeakCards(
  deckIds: string[],
  limit = 8
): Promise<Array<{ front: string; back: string; rule_description: string | null }>> {
  if (deckIds.length === 0) return [];

  if (!isSupabaseConfigured()) {
    return Array.from(mockStore.cards.values())
      .filter((c) => deckIds.includes(c.deck_id) && c.ease_factor < 2.2)
      .slice(0, limit)
      .map((c) => ({ front: c.front, back: c.back, rule_description: c.rule_description }));
  }

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("cards")
    .select("front, back, rule_description")
    .in("deck_id", deckIds)
    .lt("ease_factor", 2.2)
    .order("ease_factor", { ascending: true })
    .limit(limit);

  return data || [];
}

/**
 * Counts AI-generated decks created by the user since a timestamp (daily budget guard).
 */
export async function countUserAiDecksSince(userId: string, sinceIso: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return Array.from(mockStore.decks.values()).filter(
      (d) =>
        d.user_id === userId &&
        d.source === "ai" &&
        d.created_at &&
        d.created_at >= sinceIso
    ).length;
  }

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("decks")
    .select("id")
    .eq("user_id", userId)
    .eq("source", "ai")
    .gte("created_at", sinceIso);

  return data?.length || 0;
}

/**
 * Returns learning progress: knowledge points (sum of deck difficulty weights of
 * "mastered" cards) and the count of mastered cards. A card is mastered when it was
 * remembered at least twice in a row (SM-2 repetitions >= 2). Used for dynamic
 * proficiency level growth.
 */
export async function getUserMasteredPoints(
  userId: string
): Promise<{ points: number; masteredCards: number }> {
  if (!isSupabaseConfigured()) {
    const deckLevels = new Map<string, number>();
    for (const d of Array.from(mockStore.decks.values())) {
      if (d.user_id === userId || d.is_starter) {
        deckLevels.set(d.id, d.level || 1);
      }
    }

    let points = 0;
    let masteredCards = 0;
    for (const c of Array.from(mockStore.cards.values())) {
      const lvl = deckLevels.get(c.deck_id);
      if (lvl !== undefined && c.repetitions >= 2) {
        points += lvl;
        masteredCards++;
      }
    }
    return { points, masteredCards };
  }

  const supabase = getSupabaseAdminClient();

  const { data: deckRows } = await supabase
    .from("decks")
    .select("id, level")
    .or(`user_id.eq.${userId},is_starter.eq.true`);

  const deckLevels = new Map<string, number>();
  for (const d of deckRows || []) {
    deckLevels.set(d.id, Number(d.level) || 1);
  }
  if (deckLevels.size === 0) return { points: 0, masteredCards: 0 };

  const { data: cards } = await supabase
    .from("cards")
    .select("deck_id")
    .in("deck_id", Array.from(deckLevels.keys()))
    .gte("repetitions", 2)
    .limit(5000);

  let points = 0;
  let masteredCards = 0;
  for (const c of cards || []) {
    points += deckLevels.get(c.deck_id) || 1;
    masteredCards++;
  }
  return { points, masteredCards };
}

/**
 * Counts cards the user already reviewed today (SM-2 repetitions > 0 and updated today).
 * Used to track the daily review plan progress.
 */
export async function countCardsReviewedToday(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startIso = startOfDay.toISOString();

  if (!isSupabaseConfigured()) {
    const deckIds = new Set<string>();
    for (const d of Array.from(mockStore.decks.values())) {
      if (d.user_id === userId || d.is_starter) deckIds.add(d.id);
    }
    let count = 0;
    for (const c of Array.from(mockStore.cards.values())) {
      if (deckIds.has(c.deck_id) && c.repetitions > 0) {
        const updated = (c as { updated_at?: string }).updated_at;
        if (updated && updated >= startIso) count++;
      }
    }
    return count;
  }

  const supabase = getSupabaseAdminClient();

  const { data: deckRows } = await supabase
    .from("decks")
    .select("id")
    .or(`user_id.eq.${userId},is_starter.eq.true`);

  const deckIds = (deckRows || []).map((d) => d.id);
  if (deckIds.length === 0) return 0;

  const { data: cards } = await supabase
    .from("cards")
    .select("id")
    .in("deck_id", deckIds)
    .gte("updated_at", startIso)
    .gt("repetitions", 0)
    .limit(5000);

  return cards?.length || 0;
}

/** Size of the "Колода на сегодня" mixed session. */
export const TODAY_DECK_SIZE = 15;

export interface TodayDeckDistribution {
  level: number;
  count: number;
  percent: number;
}

/**
 * Prepares a level pool: due cards first, then the rest; inside each part
 * cards are interleaved across decks so a single deck can't dominate.
 */
function interleavePool(pool: CardItem[], nowIso: string): CardItem[] {
  const interleave = (arr: CardItem[]): CardItem[] => {
    const byDeck = new Map<string, CardItem[]>();
    for (const c of arr) {
      if (!byDeck.has(c.deck_id)) byDeck.set(c.deck_id, []);
      byDeck.get(c.deck_id)!.push(c);
    }
    const queues = Array.from(byDeck.values());
    const out: CardItem[] = [];
    let i = 0;
    while (out.length < arr.length) {
      const q = queues[i % queues.length];
      if (q.length > 0) out.push(q.shift()!);
      i++;
    }
    return out;
  };

  return [
    ...interleave(pool.filter((c) => c.next_review_at <= nowIso)),
    ...interleave(pool.filter((c) => c.next_review_at > nowIso)),
  ];
}

/**
 * Builds "Колода на сегодня": a mixed session of REAL cards (SM-2 works as usual)
 * drawn from the user's decks and distributed by difficulty —
 * see computeMixShares for the exact 60/20/20 rules and edge cases.
 */
export async function getTodayDeckCards(
  userId: string,
  pairKey: string | undefined,
  userLevel: number,
  size = TODAY_DECK_SIZE
): Promise<{
  cards: CardItem[];
  distribution: TodayDeckDistribution[];
  user_level: number;
}> {
  const decks = await getUserDecks(userId, pairKey);
  const levelByDeck = new Map<string, number>();
  for (const d of decks) levelByDeck.set(d.id, d.level || 1);
  const deckIds = Array.from(levelByDeck.keys());

  let allCards: CardItem[] = [];
  if (deckIds.length > 0) {
    if (!isSupabaseConfigured()) {
      allCards = Array.from(mockStore.cards.values()).filter((c) =>
        deckIds.includes(c.deck_id)
      );
    } else {
      const supabase = getSupabaseAdminClient();
      const { data } = await supabase
        .from("cards")
        .select(
          "id, deck_id, front, back, rule_description, interval, repetitions, ease_factor, next_review_at"
        )
        .in("deck_id", deckIds)
        .order("next_review_at", { ascending: true })
        .limit(2000);
      allCards = data || [];
    }
  }

  const nowIso = new Date().toISOString();
  const byLevel = new Map<number, CardItem[]>();
  for (const card of allCards) {
    const lvl = levelByDeck.get(card.deck_id) || 1;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(card);
  }
  for (const [lvl, pool] of Array.from(byLevel.entries())) {
    byLevel.set(lvl, interleavePool(pool, nowIso));
  }

  const availableLevels = Array.from(byLevel.keys());
  const snappedLevel = snapToAvailableLevel(availableLevels, userLevel);
  const shares = computeMixShares(availableLevels, userLevel);

  // Shares → card counts, rounding drift goes to the largest bucket
  const counts = new Map<number, number>();
  let allocated = 0;
  for (const s of shares) {
    const n = Math.round(size * s.percent);
    counts.set(s.level, n);
    allocated += n;
  }
  if (shares.length > 0 && allocated !== size) {
    let largest = shares[0];
    for (const s of shares) {
      if ((counts.get(s.level) || 0) > (counts.get(largest.level) || 0)) largest = s;
    }
    counts.set(largest.level, Math.max(0, (counts.get(largest.level) || 0) + (size - allocated)));
  }

  // Take cards per level according to the mix
  const picked: CardItem[] = [];
  const used = new Set<string>();
  for (const [lvl, count] of Array.from(counts.entries())) {
    const pool = (byLevel.get(lvl) || []).filter((c) => !used.has(c.id));
    for (const card of pool.slice(0, count)) {
      used.add(card.id);
      picked.push(card);
    }
  }

  // Spill: fill the remainder from the nearest levels, then any cards
  if (picked.length < size) {
    const rest = allCards
      .filter((c) => !used.has(c.id))
      .sort(
        (a, b) =>
          Math.abs((levelByDeck.get(a.deck_id) || 1) - snappedLevel) -
          Math.abs((levelByDeck.get(b.deck_id) || 1) - snappedLevel)
      );
    for (const card of rest) {
      if (picked.length >= size) break;
      used.add(card.id);
      picked.push(card);
    }
  }

  // Light shuffle so cards from different decks alternate
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  const result = picked.slice(0, size);
  const distribution: TodayDeckDistribution[] = Array.from(counts.keys())
    .map((lvl) => {
      const count = result.filter((c) => (levelByDeck.get(c.deck_id) || 1) === lvl).length;
      return { level: lvl, count, percent: result.length ? count / result.length : 0 };
    })
    .filter((d) => d.count > 0)
    .sort((a, b) => a.level - b.level);

  return { cards: result, distribution, user_level: snappedLevel };
}

/**
 * Appends a review event to the review_log (best-effort analytics for the refill pipeline).
 */
export async function logCardReview(
  userId: string,
  cardId: string,
  deckId: string | null,
  grade: SM2Grade
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("review_log").insert({
      user_id: userId,
      card_id: cardId,
      deck_id: deckId,
      grade,
    });
  } catch (err) {
    // Analytics must never break the review flow
    console.warn("Failed to log card review:", err);
  }
}

/**
 * Deletes a deck and cascades to cards.
 */
export async function deleteUserDeck(userId: string, deckId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    mockStore.decks.delete(deckId);
    for (const [cardId, card] of Array.from(mockStore.cards.entries())) {
      if (card.deck_id === deckId) {
        mockStore.cards.delete(cardId);
      }
    }
    return true;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("decks")
    .delete()
    .eq("id", deckId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

/**
 * Updates a card using SM-2 calculation.
 */
export async function updateCardReview(
  userId: string,
  cardId: string,
  grade: SM2Grade
): Promise<{ card: CardItem; sm2Result: ReturnType<typeof calculateSM2> }> {
  if (!isSupabaseConfigured()) {
    const card = mockStore.cards.get(cardId);
    if (!card || card.user_id !== userId) {
      throw new Error("Card not found");
    }

    const sm2Result = calculateSM2(
      {
        interval: card.interval,
        repetitions: card.repetitions,
        ease_factor: card.ease_factor,
      },
      grade
    );

    card.interval = sm2Result.interval;
    card.repetitions = sm2Result.repetitions;
    card.ease_factor = sm2Result.ease_factor;
    card.next_review_at = sm2Result.next_review_at.toISOString();

    mockStore.cards.set(cardId, card);

    await logCardReview(userId, cardId, card.deck_id, grade);

    return { card, sm2Result };
  }

  const supabase = getSupabaseAdminClient();

  const { data: currentCard, error: fetchErr } = await supabase
    .from("cards")
    .select("id, deck_id, front, back, rule_description, interval, repetitions, ease_factor, next_review_at")
    .eq("id", cardId)
    .single();

  if (fetchErr || !currentCard) {
    throw new Error("Card not found");
  }

  const sm2Result = calculateSM2(
    {
      interval: currentCard.interval,
      repetitions: currentCard.repetitions,
      ease_factor: currentCard.ease_factor,
    },
    grade
  );

  const { data: updatedCard, error: updateErr } = await supabase
    .from("cards")
    .update({
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      ease_factor: sm2Result.ease_factor,
      next_review_at: sm2Result.next_review_at.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", cardId)
    .select("id, deck_id, front, back, rule_description, interval, repetitions, ease_factor, next_review_at")
    .single();

  if (updateErr || !updatedCard) {
    throw new Error(updateErr?.message || "Failed to update card");
  }

  await logCardReview(userId, cardId, updatedCard.deck_id, grade);

  return { card: updatedCard, sm2Result };
}
