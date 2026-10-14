import type { SeedDeck } from "./seed-data";
import { EXTRA_RU_UZ } from "./seed-data-extra-ru-uz";
import { EXTRA_RU_EN } from "./seed-data-extra-ru-en";
import { EXTRA_UZ_RU } from "./seed-data-extra-uz-ru";
import { EXTRA_UZ_EN } from "./seed-data-extra-uz-en";
import { EXTRA_RU_IT } from "./seed-data-extra-ru-it";
import { EXTRA_UZ_IT } from "./seed-data-extra-uz-it";
import { EXTRA_VERBS } from "./seed-data-extra-verbs";

/**
 * Extra seed decks that triple the amount of cards per language pair
 * (+12 decks / +102 cards per pair → 51 becomes 153 cards), plus the
 * top-12 everyday verbs deck for each pair.
 * Split into one file per pair for maintainability; merged into STARTER_DECKS
 * at the bottom of seed-data.ts.
 */
export const EXTRA_DECKS: Record<string, SeedDeck[]> = {
  "ru-uz": [...EXTRA_RU_UZ, ...(EXTRA_VERBS["ru-uz"] || [])],
  "ru-en": [...EXTRA_RU_EN, ...(EXTRA_VERBS["ru-en"] || [])],
  "uz-ru": [...EXTRA_UZ_RU, ...(EXTRA_VERBS["uz-ru"] || [])],
  "uz-en": [...EXTRA_UZ_EN, ...(EXTRA_VERBS["uz-en"] || [])],
  "ru-it": [...EXTRA_RU_IT, ...(EXTRA_VERBS["ru-it"] || [])],
  "uz-it": [...EXTRA_UZ_IT, ...(EXTRA_VERBS["uz-it"] || [])],
};
