import { calculateSM2, SM2Grade } from "@/lib/sm2";

/**
 * Manually created decks — stored ONLY on this device (localStorage).
 * They are never sent to the server and are not visible from other devices:
 * all data and SM-2 progress live in the browser storage.
 */

export const LOCAL_DECK_PREFIX = "local-";
const STORAGE_KEY = "manual_decks_v1";

export interface LocalCard {
  id: string;
  front: string;
  back: string;
  rule_description: string;
  interval: number;
  repetitions: number;
  ease_factor: number;
  next_review_at: string;
}

export interface LocalDeck {
  id: string;
  title: string;
  description: string;
  level: number;
  native_language: string;
  target_language: string;
  language_pair: string;
  cards: LocalCard[];
  created_at: string;
}

export function isLocalDeckId(id: string): boolean {
  return typeof id === "string" && id.startsWith(LOCAL_DECK_PREFIX);
}

function readAll(): LocalDeck[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(decks: LocalDeck[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch (err) {
    console.warn("Failed to save local decks:", err);
  }
}

export function getLocalDecks(): LocalDeck[] {
  return readAll();
}

export function getLocalDeck(id: string): LocalDeck | null {
  return readAll().find((d) => d.id === id) || null;
}

export function deleteLocalDeck(id: string): void {
  writeAll(readAll().filter((d) => d.id !== id));
}

/** Creates and persists a manual deck with fresh cards and SM-2 defaults. */
export function createLocalDeck(input: {
  title: string;
  description?: string;
  level: number;
  native_language: string;
  target_language: string;
  cards: Array<{ front: string; back: string; rule_description?: string }>;
}): LocalDeck {
  const now = new Date().toISOString();
  const deck: LocalDeck = {
    id: `${LOCAL_DECK_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim(),
    description: (input.description || "").trim(),
    level: Math.min(5, Math.max(1, Math.round(input.level) || 1)),
    native_language: input.native_language,
    target_language: input.target_language,
    language_pair: `${input.native_language}-${input.target_language}`.toLowerCase(),
    created_at: now,
    cards: input.cards.map((c, i) => ({
      id: `lc-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      front: c.front.trim(),
      back: c.back.trim(),
      rule_description: (c.rule_description || "").trim(),
      interval: 0,
      repetitions: 0,
      ease_factor: 2.5,
      next_review_at: now, // due immediately
    })),
  };

  writeAll([...readAll(), deck]);
  return deck;
}

/** Applies an SM-2 grade to a local card and persists the progress. */
export function gradeLocalCard(deckId: string, cardId: string, grade: SM2Grade): void {
  const decks = readAll();
  const deck = decks.find((d) => d.id === deckId);
  const card = deck?.cards.find((c) => c.id === cardId);
  if (!deck || !card) return;

  const sm2 = calculateSM2(
    {
      interval: card.interval,
      repetitions: card.repetitions,
      ease_factor: card.ease_factor,
    },
    grade
  );

  card.interval = sm2.interval;
  card.repetitions = sm2.repetitions;
  card.ease_factor = sm2.ease_factor;
  card.next_review_at = sm2.next_review_at.toISOString();

  writeAll(decks);
}

/** Number of cards due for review right now. */
export function countDueLocalCards(deck: LocalDeck): number {
  const now = new Date().toISOString();
  return deck.cards.filter((c) => c.next_review_at <= now).length;
}

/**
 * Converts a local deck to the hub's DeckItem shape so it appears in the deck
 * list (with its own due counter) alongside server decks.
 */
export function localDeckToDeckItem(deck: LocalDeck) {
  return {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    native_language: deck.native_language,
    target_language: deck.target_language,
    language_pair: deck.language_pair,
    level: deck.level,
    is_starter: false,
    is_dynamic: false,
    total_cards: deck.cards.length,
    due_cards: countDueLocalCards(deck),
    is_local: true,
  };
}

/** Local deck items for one language pair (for the hub deck list). */
export function getLocalDeckItems(pairKey: string) {
  const pair = pairKey.toLowerCase();
  return readAll()
    .filter((d) => d.language_pair === pair)
    .map(localDeckToDeckItem);
}
