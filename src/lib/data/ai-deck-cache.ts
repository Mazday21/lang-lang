import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/data/decks";
import { hashContent } from "@/lib/utils/hash";
import {
  embedText,
  buildDeckEmbeddingText,
  cosineSimilarity,
  isValidEmbedding,
} from "@/lib/ai/embedding";

/**
 * AI deck template cache: a separate store of AI-generated decks.
 *
 * Every AI request gets a signature (kind + language pair + level + topic).
 * Before calling the AI we look the signature up here — an already generated
 * deck is reused instantly (0 AI tokens). Only real misses hit the model,
 * and every fresh result is stored as a new template variant.
 * When several variants exist for one request, the least-used one is served
 * to keep repetition varied.
 */

export type AiTemplateKind = "deck" | "topics";

export interface AiTemplateMeta {
  request_hash: string;
  request_key: string;
  kind: AiTemplateKind;
  native_language: string;
  target_language: string;
  level: number;
  topic: string;
}

interface TemplateRow extends AiTemplateMeta {
  id: string;
  payload: unknown;
  payload_hash: string;
  times_used: number;
  embedding?: number[];
}

/** Vector indicator for a template payload (decks only). */
function templateEmbedding(kind: AiTemplateKind, payload: unknown): number[] | null {
  if (kind !== "deck") return null;
  const deck = payload as {
    deck_name?: string;
    description?: string;
    cards?: Array<{ front: string; back: string }>;
  };
  return embedText(
    buildDeckEmbeddingText({
      title: deck?.deck_name || "",
      description: deck?.description || "",
      cards: deck?.cards || [],
    })
  );
}

// In-memory fallback for local dev mode (globalThis: survives per-route module copies)
const g = globalThis as unknown as { __aiTemplates?: Map<string, TemplateRow[]> };
const mockTemplates: Map<string, TemplateRow[]> =
  g.__aiTemplates || (g.__aiTemplates = new Map());

/** Builds the request signature used as the cache key. */
export function buildAiTemplateMeta(
  kind: AiTemplateKind,
  nativeLanguage: string,
  targetLanguage: string,
  level: number,
  subject: string
): AiTemplateMeta {
  const normalizedSubject = subject.trim().toLowerCase().replace(/\s+/g, " ");
  const request_key = `${kind}:${nativeLanguage}-${targetLanguage}:L${level}:${normalizedSubject}`;
  return {
    request_hash: hashContent(request_key),
    request_key: request_key.slice(0, 300),
    kind,
    native_language: nativeLanguage,
    target_language: targetLanguage,
    level,
    topic: subject.trim().slice(0, 120),
  };
}

/**
 * Returns a previously generated payload for this exact request
 * (least-used variant first), or null when the cache is empty.
 */
export async function findCachedPayload<T>(requestHash: string): Promise<T | null> {
  try {
    if (!isSupabaseConfigured()) {
      const rows = mockTemplates.get(requestHash) || [];
      if (rows.length === 0) return null;
      rows.sort((a, b) => a.times_used - b.times_used);
      const pick = rows[Math.floor(Math.random() * Math.min(3, rows.length))];
      pick.times_used += 1;
      return pick.payload as T;
    }

    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("ai_deck_templates")
      .select("id, payload, times_used")
      .eq("request_hash", requestHash)
      .order("times_used", { ascending: true })
      .limit(5);

    const rows = data || [];
    if (rows.length === 0) return null;

    const pick = rows[Math.floor(Math.random() * Math.min(3, rows.length))];
    await supabase
      .from("ai_deck_templates")
      .update({ times_used: (pick.times_used ?? 0) + 1 })
      .eq("id", pick.id);

    return pick.payload as T;
  } catch (err) {
    console.warn("AI template cache read failed:", err);
    return null;
  }
}

/**
 * Stores a freshly generated payload as a reusable template.
 * Identical outputs for the same request are not duplicated.
 */
export async function saveCachedPayload(
  meta: AiTemplateMeta,
  payload: unknown
): Promise<void> {
  const payloadHash = hashContent(JSON.stringify(payload));

  if (!isSupabaseConfigured()) {
    const rows = mockTemplates.get(meta.request_hash) || [];
    if (!rows.some((r) => r.payload_hash === payloadHash)) {
      rows.push({
        id: hashContent(meta.request_hash + payloadHash),
        ...meta,
        payload,
        payload_hash: payloadHash,
        times_used: 0,
        embedding: templateEmbedding(meta.kind, payload) || undefined,
      });
      mockTemplates.set(meta.request_hash, rows);
    }
    return;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("ai_deck_templates").insert({
      request_hash: meta.request_hash,
      request_key: meta.request_key,
      kind: meta.kind,
      native_language: meta.native_language,
      target_language: meta.target_language,
      level: meta.level,
      topic: meta.topic,
      payload,
      payload_hash: payloadHash,
      times_used: 0,
      embedding: templateEmbedding(meta.kind, payload),
    });
    if (error && !String(error.message).toLowerCase().includes("duplicate")) {
      console.warn("AI template cache write failed:", error.message);
    }
  } catch (err) {
    console.warn("AI template cache write failed:", err);
  }
}

/**
 * Vector search over the AI template base: returns the 5 decks closest to the
 * query «по смыслу» — the fallback offered when real AI generation is
 * unavailable. Each template carries its vector indicator (embedding).
 */
export async function findSimilarTemplates(
  queryText: string,
  limit = 5
): Promise<
  Array<{
    id: string;
    source: "template";
    title: string;
    description: string | null;
    level: number;
    card_count: number;
    similarity: number;
  }>
> {
  type DeckPayload = {
    deck_name?: string;
    description?: string;
    cards?: Array<{ front: string; back: string }>;
  };

  const queryVec = embedText(queryText);
  const scored: Array<{
    id: string;
    source: "template";
    title: string;
    description: string | null;
    level: number;
    card_count: number;
    similarity: number;
  }> = [];

  const rank = (
    id: string,
    payload: DeckPayload,
    embedding: number[] | null | undefined,
    level: number
  ) => {
    let vec = isValidEmbedding(embedding) ? embedding : null;
    if (!vec) {
      vec = templateEmbedding("deck", payload);
    }
    scored.push({
      id,
      source: "template",
      title: payload?.deck_name || "Колода",
      description: payload?.description || null,
      level,
      card_count: payload?.cards?.length || 0,
      similarity: cosineSimilarity(queryVec, vec),
    });
    return vec;
  };

  if (!isSupabaseConfigured()) {
    for (const rows of Array.from(mockTemplates.values())) {
      for (const row of rows) {
        if (row.kind !== "deck") continue;
        const vec = rank(row.id, row.payload as DeckPayload, row.embedding, row.level);
        if (!row.embedding && vec) row.embedding = vec; // backfill
      }
    }
  } else {
    const supabase = getSupabaseAdminClient();
    const { data: rows } = await supabase
      .from("ai_deck_templates")
      .select("id, payload, embedding, level")
      .eq("kind", "deck")
      .order("times_used", { ascending: false })
      .limit(200);
    for (const row of rows || []) {
      const vec = rank(row.id, row.payload as DeckPayload, row.embedding, row.level);
      if (!row.embedding && vec) {
        // Lazy backfill of the vector indicator (best-effort)
        await supabase.from("ai_deck_templates").update({ embedding: vec }).eq("id", row.id);
      }
    }
  }

  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}

/** Loads a template payload by id (to instantiate a chosen suggestion). */
export async function getTemplateById(id: string): Promise<unknown | null> {
  if (!isSupabaseConfigured()) {
    for (const rows of Array.from(mockTemplates.values())) {
      const row = rows.find((r) => r.id === id);
      if (row) return row.payload;
    }
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("ai_deck_templates")
    .select("payload")
    .eq("id", id)
    .maybeSingle();
  return data?.payload || null;
}

/** Simple cache statistics (number of stored templates per kind). */
export async function countCachedTemplates(): Promise<number> {
  if (!isSupabaseConfigured()) {
    let n = 0;
    for (const rows of Array.from(mockTemplates.values())) n += rows.length;
    return n;
  }
  const supabase = getSupabaseAdminClient();
  const { count } = await supabase
    .from("ai_deck_templates")
    .select("id", { count: "exact", head: true });
  return count || 0;
}
