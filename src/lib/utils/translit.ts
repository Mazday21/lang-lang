/**
 * Cyrillic ↔ Latin transliteration for Uzbek (and Russian) text.
 * Lets learners answer either way and still be graded correct:
 *   "Rahmat" ↔ "Рахмат", "Yo'l" ↔ "Йўл", "Kechirasiz" ↔ "Кечирасиз".
 */

const CYR_TO_LAT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "j",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "x",
  ц: "s",
  ч: "ch",
  ш: "sh",
  щ: "sh",
  ъ: "",
  ы: "i",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  // Uzbek Cyrillic letters
  ў: "o",
  ғ: "g",
  қ: "q",
  ҳ: "h",
  ң: "ng",
};

/** Transliterates Cyrillic letters to Latin; Latin text passes through unchanged. */
export function cyrillicToLatin(text: string): string {
  let out = "";
  for (const ch of text.toLowerCase()) {
    out += CYR_TO_LAT[ch] ?? ch;
  }
  return out;
}

/**
 * Canonical comparison form: lowercase, Cyrillic transliterated to Latin,
 * punctuation and apostrophe variants stripped, spaces collapsed.
 * "Рахмат!" → "rahmat", "Yo'l" → "yol", "Kechirasiz" → "kechirasiz".
 */
export function canonicalForm(text: string): string {
  return cyrillicToLatin(text)
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"\u00AB\u00BB\u2013\u2014\u02BB\u02BC\u2018\u2019]/g, "")
    // Russian-typed Cyrillic uses "х" for both Uzbek "x" and "h": "Рахмат" must match "Rahmat"
    .replace(/x/g, "h")
    .replace(/\s+/g, " ")
    .trim();
}
