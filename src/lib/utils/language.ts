/**
 * Language utility for normalizing and detecting target language names
 */

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
