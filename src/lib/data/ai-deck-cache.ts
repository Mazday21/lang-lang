import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/data/decks";
import { hashContent } from "@/lib/utils/hash";

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
  payload: unknown;
  payload_hash: string;
  times_used: number;
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
      rows.push({ ...meta, payload, payload_hash: payloadHash, times_used: 0 });
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
    });
    if (error && !String(error.message).toLowerCase().includes("duplicate")) {
      console.warn("AI template cache write failed:", error.message);
    }
  } catch (err) {
    console.warn("AI template cache write failed:", err);
  }
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
