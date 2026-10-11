import type { SeedDeck } from "./seed-data";
import { EXTRA_RU_UZ } from "./seed-data-extra-ru-uz";
import { EXTRA_RU_EN } from "./seed-data-extra-ru-en";
import { EXTRA_UZ_RU } from "./seed-data-extra-uz-ru";
import { EXTRA_UZ_EN } from "./seed-data-extra-uz-en";
import { EXTRA_RU_IT } from "./seed-data-extra-ru-it";
import { EXTRA_UZ_IT } from "./seed-data-extra-uz-it";

/**
 * Extra seed decks that triple the amount of cards per language pair
 * (+12 decks / +102 cards per pair → 51 becomes 153 cards).
 * Split into one file per pair for maintainability; merged into STARTER_DECKS
 * at the bottom of seed-data.ts.
 */
export const EXTRA_DECKS: Record<string, SeedDeck[]> = {
  "ru-uz": EXTRA_RU_UZ,
  "ru-en": EXTRA_RU_EN,
  "uz-ru": EXTRA_UZ_RU,
  "uz-en": EXTRA_UZ_EN,
  "ru-it": EXTRA_RU_IT,
  "uz-it": EXTRA_UZ_IT,
};
