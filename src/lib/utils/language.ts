/**
 * Language utility for normalizing and detecting target language names
 */

export function normalizeLangCode(lang: string | null | undefined): string {
  if (!lang) return "";
  const cleaned = lang.toLowerCase().trim().replace(/[^a-zа-яё]/gi, "");

  if (cleaned.includes("ru") || cleaned.includes("рус")) return "ru";
  if (cleaned.includes("uz") || cleaned.includes("узб") || cleaned.includes("o'zb") || cleaned.includes("ozb")) return "uz";
  if (cleaned.includes("en") || cleaned.includes("анг") || cleaned.includes("ing")) return "en";
  if (cleaned.includes("tt") || cleaned.includes("тат")) return "tt";

  // Take first 2 Latin characters if available
  const match = lang.toLowerCase().match(/[a-z]{2}/);
  return match ? match[0] : cleaned.slice(0, 2);
}

/**
 * Extracts normalized language tokens from a pair string (e.g. "ru-uz", "RU -> UZ", "uz_ru", "🇷🇺 RU ➔ 🇺🇿 UZ")
 */
export function extractLangTokens(pairStr: string | null | undefined): string[] {
  if (!pairStr) return [];
  // Split by any delimiter: -, _, ->, ➔, space, slash, etc.
  const parts = pairStr.split(/[\s\-_➔\/>,:]+/).filter(Boolean);
  const codes = parts.map(normalizeLangCode).filter((code) => code.length >= 2);
  // Return unique tokens
  return Array.from(new Set(codes));
}

/**
 * Soft comparison: checks if a deck matches the requested language pair.
 * Handles any order (ru-uz or uz-ru), any delimiters (->, ➔, -, _), case-insensitive,
 * and matches by native_language, target_language, or title if language_pair is missing.
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

  const filterTokens = extractLangTokens(filterPair);
  if (filterTokens.length === 0) return true;

  // 1. Check deck.language_pair with soft token extraction
  if (deck.language_pair) {
    const deckTokens = extractLangTokens(deck.language_pair);
    if (filterTokens.length >= 2 && deckTokens.length >= 2) {
      const matchAll = filterTokens.every((t) => deckTokens.includes(t));
      if (matchAll) return true;
    }
    // If filter or deck has only 1 recognized token
    if (filterTokens.some((t) => deckTokens.includes(t))) {
      return true;
    }
  }

  // 2. Check deck.native_language and deck.target_language
  const deckNat = normalizeLangCode(deck.native_language);
  const deckTar = normalizeLangCode(deck.target_language);
  const deckLangs = [deckNat, deckTar].filter(Boolean);

  if (filterTokens.length >= 2 && deckLangs.length >= 2) {
    if (filterTokens.every((t) => deckLangs.includes(t))) {
      return true;
    }
  } else if (deckTar && filterTokens.includes(deckTar)) {
    return true;
  }

  // 3. Fallback: check title and description
  const combinedText = `${deck.title || ""} ${deck.description || ""}`.toLowerCase();
  let matchesTitle = false;
  for (const t of filterTokens) {
    if (t === "uz" && (combinedText.includes("узбек") || combinedText.includes("uzbek") || combinedText.includes("o'zbek") || combinedText.includes("chorsu") || combinedText.includes("базар"))) {
      matchesTitle = true;
    }
    if (t === "en" && (combinedText.includes("english") || combinedText.includes("англ") || combinedText.includes("essential") || combinedText.includes("travel"))) {
      matchesTitle = true;
    }
    if (t === "ru" && (combinedText.includes("русск") || combinedText.includes("rus") || combinedText.includes("iboralar") || combinedText.includes("salomlashish"))) {
      matchesTitle = true;
    }
  }
  if (matchesTitle) return true;

  // 4. If deck has no language metadata at all, DO NOT hide it from the user
  if (!deck.language_pair && !deck.native_language && !deck.target_language) {
    return true;
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
  if (
    lower.includes("русск") ||
    lower.includes("russian") ||
    lower.includes("rus")
  ) {
    return "русский";
  }
  if (
    lower.includes("испан") ||
    lower.includes("spanish") ||
    lower.includes("ispan")
  ) {
    return "испанский";
  }
  if (
    lower.includes("турец") ||
    lower.includes("turkish") ||
    lower.includes("turk")
  ) {
    return "турецкий";
  }
  if (
    lower.includes("немец") ||
    lower.includes("german") ||
    lower.includes("nemis")
  ) {
    return "немецкий";
  }
  if (
    lower.includes("француз") ||
    lower.includes("french") ||
    lower.includes("fransuz")
  ) {
    return "французский";
  }
  if (
    lower.includes("араб") ||
    lower.includes("arabic") ||
    lower.includes("arab")
  ) {
    return "арабский";
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
  if (lower.includes("рус")) return "ru";
  if (lower.includes("испан")) return "es";
  if (lower.includes("турец")) return "tr";
  if (lower.includes("немец")) return "de";
  if (lower.includes("француз")) return "fr";
  if (lower.includes("араб")) return "ar";
  return "uz";
}
