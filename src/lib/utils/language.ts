/**
 * Language utility for normalizing and detecting target language names
 */

/**
 * Normalizes language code ("ru", "uz", "en", "tt", etc.)
 * Strictly translates "gb" -> "en".
 */
export function normalizeLangCode(lang: string | null | undefined): string {
  if (!lang) return "";
  const cleaned = lang.toLowerCase().trim().replace(/[^a-zа-яё]/gi, "");

  if (cleaned === "gb" || cleaned.includes("en") || cleaned.includes("анг") || cleaned.includes("ing")) return "en";
  if (cleaned.includes("ru") || cleaned.includes("рус")) return "ru";
  if (cleaned.includes("uz") || cleaned.includes("узб") || cleaned.includes("o'zb") || cleaned.includes("ozb")) return "uz";
  if (cleaned.includes("it") || cleaned.includes("итал") || cleaned.includes("ital")) return "it";
  if (cleaned.includes("tt") || cleaned.includes("тат")) return "tt";

  // Take first 2 Latin characters if available
  const match = lang.toLowerCase().match(/[a-z]{2}/);
  if (match) {
    if (match[0] === "gb") return "en";
    return match[0];
  }
  return cleaned.slice(0, 2);
}

/**
 * Extracts ordered language tokens from a pair string (e.g. "ru-uz" -> ["ru", "uz"], "uz-en" -> ["uz", "en"]).
 * Preserves the direction (native -> target).
 */
export function extractDirectedLangTokens(pairStr: string | null | undefined): string[] {
  if (!pairStr) return [];
  const parts = pairStr.split(/[\s\-_➔\/>,:]+/).filter(Boolean);
  return parts.map(normalizeLangCode).filter((code) => code.length >= 2);
}

/**
 * Extracts unique language tokens from a pair string (backward compatibility).
 */
export function extractLangTokens(pairStr: string | null | undefined): string[] {
  return Array.from(new Set(extractDirectedLangTokens(pairStr)));
}

/**
 * Normalizes a pair string into canonical "native-target" (e.g. "ru-uz", "uz-en", "uz-ru").
 */
export function normalizePairKey(pairStr: string | null | undefined): string {
  if (!pairStr) return "";
  const tokens = extractDirectedLangTokens(pairStr);
  if (tokens.length >= 2) {
    return `${tokens[0]}-${tokens[1]}`.toLowerCase();
  }
  if (tokens.length === 1) {
    return tokens[0].toLowerCase();
  }
  return "";
}

/**
 * Resolves the canonical pair key for a deck (e.g. "ru-uz", "uz-en").
 */
export function getDeckPairKey(deck: {
  language_pair?: string | null;
  native_language?: string | null;
  target_language?: string | null;
}): string {
  if (deck.language_pair) {
    const pair = normalizePairKey(deck.language_pair);
    if (pair.includes("-")) return pair;
  }
  const nat = normalizeLangCode(deck.native_language) || "ru";
  const tar = normalizeLangCode(deck.target_language);
  return tar ? `${nat}-${tar}`.toLowerCase() : "";
}

/**
 * Strict comparison: checks if a deck's language_pair strictly matches the requested pair.
 * E.g. when filterPair is "ru-uz", ONLY "ru-uz" decks match. "uz-ru" and "uz-en" return false!
 */
export function isDeckMatchingPair(
  deck: {
    language_pair?: string | null;
    native_language?: string | null;
    target_language?: string | null;
    title?: string | null;
    description?: string | null;
  },
  filterPair?: string | null
): boolean {
  if (!filterPair) return true; // No filter -> show all

  const targetPair = normalizePairKey(filterPair);
  if (!targetPair) return true;

  const deckPair = getDeckPairKey(deck);
  if (deckPair) {
    return deckPair === targetPair;
  }

  return false;
}

export function detectLanguageFromText(text: string, defaultLang = "узбекский"): string {
  if (!text) return defaultLang;
  const lower = text.toLowerCase();

  if (
    lower.includes("узбек") ||
    lower.includes("o'zbek") ||
    lower.includes("ozbek") ||
    lower.includes("uzbek")
  ) {
    return "узбекский";
  }
  if (lower.includes("татар") || lower.includes("tatar")) {
    return "татарский";
  }
  if (
    lower.includes("англ") ||
    lower.includes("english") ||
    lower.includes("ingliz")
  ) {
    return "английский";
  }
  if (lower.includes("итал") || lower.includes("italian") || lower.includes("italiano")) {
    return "итальянский";
  }
  if (
    lower.includes("русск") ||
    lower.includes("russian") ||
    lower.includes("rus tili")
  ) {
    return "русский";
  }

  return defaultLang;
}

/**
 * Maps human-readable Russian language name to ISO 639-1 code for Whisper/STT fallback
 */
export function languageToIsoCode(language: string): string {
  const lower = language.toLowerCase();
  if (lower.includes("узбек")) return "uz";
  if (lower.includes("татар")) return "tt";
  if (lower.includes("англ")) return "en";
  if (lower.includes("итал")) return "it";
  if (lower.includes("рус")) return "ru";
  return "uz";
}
