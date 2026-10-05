import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { calculateSM2, SM2Grade } from "@/lib/sm2";
import { SEED_DECKS } from "@/lib/data/seed-data";
import { GeneratedDeckResult } from "@/lib/ai/deck-generator";

export interface DeckItem {
  id: string;
  title: string;
  description: string | null;
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
  decks: Map<string, { id: string; user_id: string; title: string; description: string; is_dynamic: boolean }>;
  cards: Map<string, {
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
  }>;
}

const mockStore: MockStore = {
  seededUsers: new Set(),
  decks: new Map(),
  cards: new Map(),
};

function seedMockStore(userId: string) {
  mockStore.seededUsers.add(userId);
  let deckIdx = 1;
  for (const seedDeck of SEED_DECKS) {
    const deckId = `deck-${deckIdx++}`;
    mockStore.decks.set(deckId, {
      id: deckId,
      user_id: userId,
      title: seedDeck.title,
      description: seedDeck.description,
      is_dynamic: true,
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
  }
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Ensures user has starter decks on first visit.
 */
export async function ensureUserSeeded(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    if (!mockStore.seededUsers.has(userId)) {
      seedMockStore(userId);
    }
    return;
  }

  const supabase = getSupabaseAdminClient();

  // Check if user has ever had decks created
  const { count, error } = await supabase
    .from("decks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error checking user decks in Supabase:", error);
    return;
  }

  // Only seed if strictly 0 decks exist
  if ((count ?? 0) === 0) {
    for (const seedDeck of SEED_DECKS) {
      const { data: deck, error: deckErr } = await supabase
        .from("decks")
        .insert({
          user_id: userId,
          title: seedDeck.title,
          description: seedDeck.description,
          is_dynamic: true,
        })
        .select("id")
        .single();

      if (deckErr || !deck) {
        console.error("Failed to seed deck:", deckErr);
        continue;
      }

      const cardsToInsert = seedDeck.cards.map((c) => ({
        user_id: userId,
        deck_id: deck.id,
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
    }
  }
}

/**
 * Returns all decks for the user with count of due cards (next_review_at <= now).
 */
export async function getUserDecks(userId: string): Promise<DeckItem[]> {
  await ensureUserSeeded(userId);

  const nowIso = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const userDecks = Array.from(mockStore.decks.values()).filter((d) => d.user_id === userId);
    const allCards = Array.from(mockStore.cards.values()).filter((c) => c.user_id === userId);

    return userDecks.map((d) => {
      const deckCards = allCards.filter((c) => c.deck_id === d.id);
      const dueCards = deckCards.filter((c) => c.next_review_at <= nowIso);
      return {
        id: d.id,
        title: d.title,
        description: d.description,
        is_dynamic: d.is_dynamic ?? true,
        total_cards: deckCards.length,
        due_cards: dueCards.length,
      };
    });
  }

  const supabase = getSupabaseAdminClient();

  const { data: decks, error: decksErr } = await supabase
    .from("decks")
    .select("id, title, description, is_dynamic")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (decksErr || !decks) {
    throw new Error(decksErr?.message || "Failed to fetch decks");
  }

  const { data: cards, error: cardsErr } = await supabase
    .from("cards")
    .select("id, deck_id, next_review_at")
    .eq("user_id", userId);

  if (cardsErr) {
    throw new Error(cardsErr.message);
  }

  return decks.map((deck) => {
    const deckCards = (cards || []).filter((c) => c.deck_id === deck.id);
    const dueCards = deckCards.filter((c) => c.next_review_at <= nowIso);
    return {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      is_dynamic: deck.is_dynamic ?? true,
      total_cards: deckCards.length,
      due_cards: dueCards.length,
    };
  });
}

/**
 * Returns cards for review in a specific deck.
 */
export async function getDeckCards(
  userId: string,
  deckId: string
): Promise<{ deck: { id: string; title: string; description: string | null; is_dynamic?: boolean }; cards: CardItem[] }> {
  await ensureUserSeeded(userId);

  const nowIso = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const deck = mockStore.decks.get(deckId);
    if (!deck || deck.user_id !== userId) {
      throw new Error("Deck not found");
    }

    const deckCards = Array.from(mockStore.cards.values()).filter(
      (c) => c.deck_id === deckId && c.user_id === userId
    );

    let trainingCards = deckCards.filter((c) => c.next_review_at <= nowIso);
    if (trainingCards.length === 0) {
      trainingCards = [...deckCards];
    }

    return {
      deck: { id: deck.id, title: deck.title, description: deck.description, is_dynamic: deck.is_dynamic ?? true },
      cards: trainingCards,
    };
  }

  const supabase = getSupabaseAdminClient();

  const { data: deck, error: deckErr } = await supabase
    .from("decks")
    .select("id, title, description, is_dynamic")
    .eq("id", deckId)
    .eq("user_id", userId)
    .single();

  if (deckErr || !deck) {
    throw new Error("Deck not found");
  }

  const { data: dueCards, error: dueErr } = await supabase
    .from("cards")
    .select("id, deck_id, front, back, rule_description, interval, repetitions, ease_factor, next_review_at")
    .eq("deck_id", deckId)
    .eq("user_id", userId)
    .lte("next_review_at", nowIso)
    .order("next_review_at", { ascending: true });

  if (dueErr) throw new Error(dueErr.message);

  let cards = dueCards || [];

  if (cards.length === 0) {
    const { data: allCards, error: allErr } = await supabase
      .from("cards")
      .select("id, deck_id, front, back, rule_description, interval, repetitions, ease_factor, next_review_at")
      .eq("deck_id", deckId)
      .eq("user_id", userId)
      .order("next_review_at", { ascending: true });

    if (allErr) throw new Error(allErr.message);
    cards = allCards || [];
  }

  return {
    deck,
    cards,
  };
}

/**
 * Creates a brand new deck with generated cards.
 */
export async function createDeckWithCards(
  userId: string,
  deckData: GeneratedDeckResult
): Promise<{ id: string; title: string }> {
  if (!isSupabaseConfigured()) {
    mockStore.seededUsers.add(userId);
    const deckId = `deck-ai-${Date.now()}`;
    mockStore.decks.set(deckId, {
      id: deckId,
      user_id: userId,
      title: deckData.deck_name,
      description: deckData.description,
      is_dynamic: true,
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

    return { id: deckId, title: deckData.deck_name };
  }

  const supabase = getSupabaseAdminClient();

  const { data: newDeck, error: deckErr } = await supabase
    .from("decks")
    .insert({
      user_id: userId,
      title: deckData.deck_name,
      description: deckData.description,
      is_dynamic: true,
    })
    .select("id, title")
    .single();

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

  return newDeck;
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

    return { card, sm2Result };
  }

  const supabase = getSupabaseAdminClient();

  const { data: currentCard, error: fetchErr } = await supabase
    .from("cards")
    .select("id, deck_id, front, back, rule_description, interval, repetitions, ease_factor, next_review_at")
    .eq("id", cardId)
    .eq("user_id", userId)
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
    .eq("user_id", userId)
    .select("id, deck_id, front, back, rule_description, interval, repetitions, ease_factor, next_review_at")
    .single();

  if (updateErr || !updatedCard) {
    throw new Error(updateErr?.message || "Failed to update card");
  }

  return { card: updatedCard, sm2Result };
}
