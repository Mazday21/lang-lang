import type { SeedCard, SeedDeck } from "./seed-data";

/**
 * Uzbek verb drills (based on the «uzProver» trainer), full progression:
 *
 *   1) Present tense, one deck per person ending — -man (я), -san (ты),
 *      -miz (мы), -siz (вы) + -ish (само действие / процесс).
 *   2) Reverse decks: the Uzbek form on the front → recall the Russian phrase.
 *   3) «Смешанные лица» — the four person endings interleaved (final test).
 *   4) Negatives: -may- (present) and -mas- (categorical) with persons mixed.
 *   5) Past tense: -dim / -ding / -dik / -dingiz with persons mixed.
 *
 * Assembly rules (same as the trainer's «конструктор слов»):
 *   present: root + connector (-a- after a consonant, -y- after a vowel) + ending
 *            bor + a + man = boraman        qara + y + man = qarayman
 *   -ish:    root + -ish / -sh after a vowel:  borish, qarash
 *   -may- / -mas-: root + -may-/-mas- + person ending (no connector):
 *            bormayman, bormasman, qaramayman
 *   past:    root + -dim/-ding/-dik/-dingiz: bordim, qaradim;
 *            after -t the ending sounds like -ti: aytti + m = ayttim
 *
 * All cards are regular flashcards — they flow into SM-2, «Колода на сегодня»
 * and the «Грамматическое правило» section, which shows the morphemic
 * breakdown («bor + a + man = boraman»).
 */

interface VerbRoot {
  root: string; // verb stem (apostrophe: ko'r)
  rus: string; // infinitive translation
  vowel: boolean; // stem ends with a vowel → connector -y- / suffix -sh
  /** RU present forms: [я, ты, мы, вы] */
  forms: [string, string, string, string];
  /** RU negative-present glosses (-may-): «не ...» */
  negMay: [string, string, string, string];
  /** RU categorical-negative glosses (-mas-): «не пойду», «не знаю» … */
  negMas: [string, string, string, string];
  /** RU past glosses: «пошёл», «сделал» … */
  past: [string, string, string, string];
  /** UZ past forms override (assimilation: ayt- + -dim → ayttim) */
  pastUz?: [string, string, string, string];
}

const ROOTS: VerbRoot[] = [
  {
    root: "bor", rus: "идти", vowel: false,
    forms: ["иду", "идёшь", "идём", "идёте"],
    negMay: ["не иду", "не идёшь", "не идём", "не идёте"],
    negMas: ["не пойду", "не пойдёшь", "не пойдём", "не пойдёте"],
    past: ["пошёл", "пошёл", "пошли", "пошли"],
  },
  {
    root: "kel", rus: "приходить", vowel: false,
    forms: ["прихожу", "приходишь", "приходим", "приходите"],
    negMay: ["не прихожу", "не приходишь", "не приходим", "не приходите"],
    negMas: ["не приду", "не придёшь", "не придём", "не придёте"],
    past: ["пришёл", "пришёл", "пришли", "пришли"],
  },
  {
    root: "ol", rus: "брать", vowel: false,
    forms: ["беру", "берёшь", "берём", "берёте"],
    negMay: ["не беру", "не берёшь", "не берём", "не берёте"],
    negMas: ["не возьму", "не возьмёшь", "не возьмём", "не возьмёте"],
    past: ["взял", "взял", "взяли", "взяли"],
  },
  {
    root: "ber", rus: "давать", vowel: false,
    forms: ["даю", "даёшь", "даём", "даёте"],
    negMay: ["не даю", "не даёшь", "не даём", "не даёте"],
    negMas: ["не дам", "не дашь", "не дадим", "не дадите"],
    past: ["дал", "дал", "дали", "дали"],
  },
  {
    root: "qil", rus: "делать", vowel: false,
    forms: ["делаю", "делаешь", "делаем", "делаете"],
    negMay: ["не делаю", "не делаешь", "не делаем", "не делаете"],
    negMas: ["не сделаю", "не сделаешь", "не сделаем", "не сделаете"],
    past: ["сделал", "сделал", "сделали", "сделали"],
  },
  {
    root: "ayt", rus: "сказать", vowel: false,
    forms: ["скажу", "скажешь", "скажем", "скажете"],
    negMay: ["не скажу", "не скажешь", "не скажем", "не скажете"],
    negMas: ["не стану говорить", "не станешь говорить", "не станем говорить", "не станете говорить"],
    past: ["сказал", "сказал", "сказали", "сказали"],
    pastUz: ["ayttim", "aytting", "ayttik", "ayttingiz"],
  },
  {
    root: "gapir", rus: "говорить", vowel: false,
    forms: ["говорю", "говоришь", "говорим", "говорите"],
    negMay: ["не говорю", "не говоришь", "не говорим", "не говорите"],
    negMas: ["не буду говорить", "не будешь говорить", "не будем говорить", "не будете говорить"],
    past: ["поговорил", "поговорил", "поговорили", "поговорили"],
  },
  {
    root: "bil", rus: "знать", vowel: false,
    forms: ["знаю", "знаешь", "знаем", "знаете"],
    negMay: ["не умею", "не умеешь", "не умеем", "не умеете"],
    negMas: ["не знаю", "не знаешь", "не знаем", "не знаете"],
    past: ["узнал", "узнал", "узнали", "узнали"],
  },
  {
    root: "tushun", rus: "понимать", vowel: false,
    forms: ["понимаю", "понимаешь", "понимаем", "понимаете"],
    negMay: ["не понимаю", "не понимаешь", "не понимаем", "не понимаете"],
    negMas: ["не пойму", "не поймёшь", "не поймём", "не поймёте"],
    past: ["понял", "понял", "поняли", "поняли"],
  },
  {
    root: "kut", rus: "ждать", vowel: false,
    forms: ["жду", "ждёшь", "ждём", "ждёте"],
    negMay: ["не жду", "не ждёшь", "не ждём", "не ждёте"],
    negMas: ["не подожду", "не подождёшь", "не подождём", "не подождёте"],
    past: ["ждал", "ждал", "ждали", "ждали"],
  },
  {
    root: "ko'r", rus: "видеть", vowel: false,
    forms: ["вижу", "видишь", "видим", "видите"],
    negMay: ["не вижу", "не видишь", "не видим", "не видите"],
    negMas: ["не увижу", "не увидишь", "не увидим", "не увидите"],
    past: ["увидел", "увидел", "увидели", "увидели"],
  },
  {
    root: "qara", rus: "смотреть", vowel: true,
    forms: ["смотрю", "смотришь", "смотрим", "смотрите"],
    negMay: ["не смотрю", "не смотришь", "не смотрим", "не смотрите"],
    negMas: ["не посмотрю", "не посмотришь", "не посмотрим", "не посмотрите"],
    past: ["посмотрел", "посмотрел", "посмотрели", "посмотрели"],
  },
  {
    root: "xohla", rus: "хотеть", vowel: true,
    forms: ["хочу", "хочешь", "хотим", "хотите"],
    negMay: ["не хочу", "не хочешь", "не хотим", "не хотите"],
    negMas: ["не захочу", "не захочешь", "не захотим", "не захотите"],
    past: ["захотел", "захотел", "захотели", "захотели"],
  },
];

const BASE = {
  native_language: "ru",
  target_language: "uz",
  language_pair: "ru-uz",
} as const;

interface PersonEnding {
  ending: string;
  pronoun: string;
  lower: string;
  idx: 0 | 1 | 2 | 3;
}

const PERSONS: PersonEnding[] = [
  { ending: "man", pronoun: "Я", lower: "я", idx: 0 },
  { ending: "san", pronoun: "Ты", lower: "ты", idx: 1 },
  { ending: "miz", pronoun: "Мы", lower: "мы", idx: 2 },
  { ending: "siz", pronoun: "Вы", lower: "вы", idx: 3 },
];

const CONNECTOR_HINT = "Связка: -a- после согласной, -y- после гласной основы.";

/** Present form: root + connector + person ending (boraman, qarayman). */
const presentForm = (r: VerbRoot, p: PersonEnding) =>
  r.root + (r.vowel ? "y" : "a") + p.ending;

// ─────────────────────────────────────────────────────────────────────────────
// 1) Present: one deck per person ending (RU phrase → UZ form + breakdown)
// ─────────────────────────────────────────────────────────────────────────────

function buildPersonDeck(p: PersonEnding): SeedDeck {
  return {
    title: `Глаголы: окончание -${p.ending} (${p.lower})`,
    description: `Окончание -${p.ending} — «${p.lower}». Собирается так: основа + связка (-a- после согласной, -y- после гласной) + окончание: bor + a + ${p.ending} = bora${p.ending}, qara + y + ${p.ending} = qaray${p.ending}. ${CONNECTOR_HINT}`,
    ...BASE,
    level: 2,
    cards: ROOTS.map((r) => {
      const connector = r.vowel ? "y" : "a";
      const form = presentForm(r, p);
      return {
        front: `${p.pronoun} ${r.forms[p.idx]}`,
        back: form,
        rule_description: `${r.root}- (${r.rus}) + -${p.ending} («${p.lower}») → ${r.root} + ${connector} + ${p.ending} = ${form}`,
      };
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) Reverse: UZ form → RU phrase + breakdown (recognition)
// ─────────────────────────────────────────────────────────────────────────────

function buildReverseDeck(p: PersonEnding): SeedDeck {
  return {
    title: `Распознавание форм: -${p.ending} (${p.lower})`,
    description: `Обратное направление: перед вами узбекская форма на -${p.ending} — вспомните, что она значит по-русски. Разбор формы — в правиле.`,
    ...BASE,
    level: 2,
    cards: ROOTS.map((r) => {
      const connector = r.vowel ? "y" : "a";
      const form = presentForm(r, p);
      return {
        front: form,
        back: `${p.pronoun} ${r.forms[p.idx]}`,
        rule_description: `${r.root} + ${connector} + ${p.ending} = ${form} — ${r.root}- (${r.rus}) + -${p.ending} («${p.lower}»)`,
      };
    }),
  };
}

function buildReverseIshDeck(): SeedDeck {
  return {
    title: "Распознавание форм: -ish",
    description:
      "Обратное направление: узбекская форма на -ish — вспомните, какое действие она называет. Разбор формы — в правиле.",
    ...BASE,
    level: 2,
    cards: ROOTS.map((r) => {
      const suffix = r.vowel ? "sh" : "ish";
      const form = r.root + suffix;
      return {
        front: form,
        back: `${r.rus} (процесс)`,
        rule_description: `${r.root} + ${suffix} = ${form} — ${r.root}- (${r.rus}) + -${suffix} («действие»)`,
      };
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) «Смешанные лица» — the four person endings interleaved (final test)
// ─────────────────────────────────────────────────────────────────────────────

/** Interleaves person blocks: man[0], san[0], miz[0], siz[0], man[1] … */
function interleaveByPerson(cardsFor: (p: PersonEnding) => SeedCard[]): SeedCard[] {
  const blocks = PERSONS.map(cardsFor);
  const out: SeedCard[] = [];
  for (let i = 0; i < ROOTS.length; i++) {
    for (const block of blocks) out.push(block[i]);
  }
  return out;
}

function buildMixedDeck(): SeedDeck {
  return {
    title: "Итог: смешанные лица (-man / -san / -miz / -siz)",
    description:
      "Итоговая проверка: все четыре окончания лица вперемешку. Сначала пройдите колоды по лицам — затем тестируйте себя здесь.",
    ...BASE,
    level: 3,
    cards: interleaveByPerson((p) =>
      ROOTS.map((r) => {
        const connector = r.vowel ? "y" : "a";
        const form = presentForm(r, p);
        return {
          front: `${p.pronoun} ${r.forms[p.idx]}`,
          back: form,
          rule_description: `${r.root}- (${r.rus}) + -${p.ending} («${p.lower}») → ${r.root} + ${connector} + ${p.ending} = ${form}`,
        };
      })
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) Negatives: -may- (present) and -mas- (categorical), persons interleaved
// ─────────────────────────────────────────────────────────────────────────────

function buildNegativeDeck(opts: {
  tag: string; // may | mas
  title: string;
  description: string;
  glosses: (r: VerbRoot) => [string, string, string, string];
  meaning: string; // «не» | категорическое отрицание
}): SeedDeck {
  return {
    title: opts.title,
    description: opts.description,
    ...BASE,
    level: 3,
    cards: interleaveByPerson((p) =>
      ROOTS.map((r) => {
        // -may-/-mas- attach directly — no connector, even after a vowel:
        // qaramayman, qaramasman
        const form = r.root + opts.tag + p.ending;
        return {
          front: `${p.pronoun} ${opts.glosses(r)[p.idx]}`,
          back: form,
          rule_description: `${r.root}- (${r.rus}) + -${opts.tag}- (${opts.meaning}) + -${p.ending} («${p.lower}») → ${r.root} + ${opts.tag} + ${p.ending} = ${form}`,
        };
      })
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5) Past tense: -dim / -ding / -dik / -dingiz, persons interleaved
// ─────────────────────────────────────────────────────────────────────────────

const PAST_ENDINGS = ["dim", "ding", "dik", "dingiz"];

function buildPastDeck(): SeedDeck {
  return {
    title: "Прошедшее время: -dim, -ding, -dik, -dingiz",
    description:
      "Прошедшее время: основа + окончание лица (-dim я, -ding ты, -dik мы, -dingiz вы): bordim, bording, bordik, bordingiz. После гласной основы -y- не нужен: qaradim. После -t окончание звучит как -ti: aytti + m = ayttim.",
    ...BASE,
    level: 3,
    cards: interleaveByPerson((p) =>
      ROOTS.map((r) => {
        const ending = PAST_ENDINGS[p.idx];
        const form = r.pastUz ? r.pastUz[p.idx] : r.root + ending;
        const rule = r.pastUz
          ? `${r.root}- (${r.rus}) + -${ending} («${p.lower}», прош. время) → после -t окончание звучит как -ti: aytti + ${ending.slice(1)} = ${form}`
          : `${r.root}- (${r.rus}) + -${ending} («${p.lower}», прош. время) → ${r.root} + ${ending} = ${form}`;
        return {
          front: `${p.pronoun} ${r.past[p.idx]}`,
          back: form,
          rule_description: rule,
        };
      })
    ),
  };
}

/** All conjugation decks for the ru-uz pair. */
export const UZ_CONJUGATION: SeedDeck[] = [
  // 1) Present, one deck per ending
  ...PERSONS.map(buildPersonDeck),
  {
    title: "Глаголы: -ish (действие, процесс)",
    description:
      "«-ish» превращает глагол в существительное — само действие: borish (ходьба, процесс идти). После гласной основы прикрепляется -sh: qarash, xohlash.",
    ...BASE,
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
  },
  // 2) Reverse direction
  ...PERSONS.map(buildReverseDeck),
  buildReverseIshDeck(),
  // 3) Final mixed-persons test
  buildMixedDeck(),
  // 4) Negatives
  buildNegativeDeck({
    tag: "may",
    title: "Отрицание: -may- (не делает)",
    description:
      "Отрицание в настоящем времени: основа + -may- + лицо. bormayman (не иду), bormaysan, bormaymiz, bormaysiz. После гласной основы -y- не нужен: qaramayman.",
    glosses: (r) => r.negMay,
    meaning: "«не»",
  }),
  buildNegativeDeck({
    tag: "mas",
    title: "Отрицание: -mas- (не пойду, не буду)",
    description:
      "Категорическое отрицание (решимость, будущее, «вообще нет»): основа + -mas- + лицо. bormasman (не пойду), bormassan, bormasmiz, bormassiz; qaramasman.",
    glosses: (r) => r.negMas,
    meaning: "категорич. «не»",
  }),
  // 5) Past tense
  buildPastDeck(),
];
