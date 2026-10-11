/**
 * Lightweight deterministic text embedding for semantic deck search
 * ("5 ближайших колод по смыслу").
 *
 * Feature-hashed bag of words + character trigrams (handles case endings and
 * Uzbek/Turkic suffixes), L2-normalized. Works offline, costs nothing and is
 * stable across processes — vectors can be stored in the database next to each
 * deck (the "vector indicator" for search) and compared with a dot product.
 *
 * Quality is lexical-semantic (word overlap + morphology), which matches the
 * app's usage: user topics and deck titles live in the same native language.
 */

const DIMS = 384;

/** Builds the embedding text for a deck: title + description + card sample. */
export function buildDeckEmbeddingText(input: {
  title: string;
  description?: string | null;
  cards?: Array<{ front: string; back: string }>;
}): string {
  const cardText = (input.cards || [])
    .slice(0, 25)
    .map((c) => `${c.front} ${c.back}`)
    .join(" ");
  return `${input.title} ${input.description || ""} ${cardText}`.trim();
}

export function embedText(text: string): number[] {
  const vec = new Array<number>(DIMS).fill(0);
  const normalized = text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9'’]+/gi, " ")
    .trim();
  const tokens = normalized.split(/\s+/).filter(Boolean);

  const add = (feature: string, weight: number) => {
    // FNV-1a → two independent bucket indexes with opposite signs
    let h = 2166136261;
    for (let i = 0; i < feature.length; i++) {
      h ^= feature.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const h2 = Math.imul(h ^ 0x9e3779b9, 2246822507) >>> 0;
    const i1 = (h >>> 0) % DIMS;
    const i2 = h2 % DIMS;
    vec[i1] += weight;
    if (i2 !== i1) vec[i2] -= weight;
  };

  for (const token of tokens) {
    add(token, 2); // whole word — exact meaning
    const padded = `^${token}$`;
    for (let i = 0; i < padded.length - 2; i++) {
      add(padded.slice(i, i + 3), 0.4); // trigrams — morphology tolerant
    }
  }

  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  return vec.map((v) => Number((v / norm).toFixed(6)));
}

/** Cosine similarity for L2-normalized vectors (plain dot product). */
export function cosineSimilarity(a: number[] | null, b: number[] | null): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot;
}

/** True when a stored value looks like a usable embedding. */
export function isValidEmbedding(value: unknown): value is number[] {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === "number";
}
