import type { SeedDeck } from "./seed-data";

/**
 * Uzbek verb conjugation drills (based on the «uzProver» trainer):
 * 13 everyday roots × 5 endings — -man (я), -san (ты), -miz (мы), -siz (вы)
 * and -ish (само действие / процесс).
 *
 * Assembly rule (same as the trainer's «конструктор слов»):
 *   root + connector (-a- after a consonant, -y- after a vowel) + ending
 *   bor  + a + man = boraman      qara + y + man = qarayman
 *   -ish attaches as -ish / -sh after a vowel: borish, qarash.
 *
 * Cards are regular flashcards — they flow into SM-2, «Колода на сегодня»
 * and the «Грамматическое правило» section of the flipped card, where the
 * morphemic breakdown («bor + a + man») is shown.
 */

interface VerbRoot {
  root: string; // verb stem (apostrophe: ko'r)
  rus: string; // infinitive translation
  vowel: boolean; // stem ends with a vowel → connector -y- / suffix -sh
  /** RU present forms: [я, ты, мы, вы] */
  forms: [string, string, string, string];
}

const ROOTS: VerbRoot[] = [
  { root: "bor", rus: "идти", vowel: false, forms: ["иду", "идёшь", "идём", "идёте"] },
  { root: "kel", rus: "приходить", vowel: false, forms: ["прихожу", "приходишь", "приходим", "приходите"] },
  { root: "ol", rus: "брать", vowel: false, forms: ["беру", "берёшь", "берём", "берёте"] },
  { root: "ber", rus: "давать", vowel: false, forms: ["даю", "даёшь", "даём", "даёте"] },
  { root: "qil", rus: "делать", vowel: false, forms: ["делаю", "делаешь", "делаем", "делаете"] },
  { root: "ayt", rus: "сказать", vowel: false, forms: ["скажу", "скажешь", "скажем", "скажете"] },
  { root: "gapir", rus: "говорить", vowel: false, forms: ["говорю", "говоришь", "говорим", "говорите"] },
  { root: "bil", rus: "знать", vowel: false, forms: ["знаю", "знаешь", "знаем", "знаете"] },
  { root: "tushun", rus: "понимать", vowel: false, forms: ["понимаю", "понимаешь", "понимаем", "понимаете"] },
  { root: "kut", rus: "ждать", vowel: false, forms: ["жду", "ждёшь", "ждём", "ждёте"] },
  { root: "ko'r", rus: "видеть", vowel: false, forms: ["вижу", "видишь", "видим", "видите"] },
  { root: "qara", rus: "смотреть", vowel: true, forms: ["смотрю", "смотришь", "смотрим", "смотрите"] },
  { root: "xohla", rus: "хотеть", vowel: true, forms: ["хочу", "хочешь", "хотим", "хотите"] },
];

const PERSONS = [
  {
    ending: "man",
    pronoun: "Я",
    lower: "я",
    idx: 0 as const,
    description:
      "Окончание -man — «я». Собирается так: основа + связка (-a- после согласной, -y- после гласной) + окончание: boraman, qarayman.",
  },
  {
    ending: "san",
    pronoun: "Ты",
    lower: "ты",
    idx: 1 as const,
    description:
      "Окончание -san — «ты». Основа + связка (-a- после согласной, -y- после гласной) + окончание: borasan, qaraysan.",
  },
  {
    ending: "miz",
    pronoun: "Мы",
    lower: "мы",
    idx: 2 as const,
    description:
      "Окончание -miz — «мы». Основа + связка (-a- после согласной, -y- после гласной) + окончание: boramiz, qaraymiz.",
  },
  {
    ending: "siz",
    pronoun: "Вы",
    lower: "вы",
    idx: 3 as const,
    description:
      "Окончание -siz — «вы» (вежливое обращение, ед. и мн. число). Основа + связка + окончание: borasiz, qaraysiz.",
  },
];

function buildPersonDeck(p: (typeof PERSONS)[number]): SeedDeck {
  return {
    title: `Глаголы: окончание -${p.ending} (${p.lower})`,
    description: p.description,
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 2,
    cards: ROOTS.map((r) => {
      const connector = r.vowel ? "y" : "a";
      const form = r.root + connector + p.ending;
      return {
        front: `${p.pronoun} ${r.forms[p.idx]}`,
        back: form,
        rule_description: `${r.root}- (${r.rus}) + -${p.ending} («${p.lower}») → ${r.root} + ${connector} + ${p.ending} = ${form}`,
      };
    }),
  };
}

function buildIshDeck(): SeedDeck {
  return {
    title: "Глаголы: -ish (действие, процесс)",
    description:
      "«-ish» превращает глагол в существительное — само действие: borish (ходьба, процесс идти). После гласной основы прикрепляется -sh: qarash, xohlash.",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 2,
    cards: ROOTS.map((r) => {
      const suffix = r.vowel ? "sh" : "ish";
      const form = r.root + suffix;
      return {
        front: `${r.rus} (процесс)`,
        back: form,
        rule_description: `${r.root}- (${r.rus}) + -${suffix} («действие») → ${r.root} + ${suffix} = ${form}`,
      };
    }),
  };
}

/** Five decks / 65 cards for the ru-uz pair. */
export const UZ_CONJUGATION: SeedDeck[] = [
  ...PERSONS.map(buildPersonDeck),
  buildIshDeck(),
];
