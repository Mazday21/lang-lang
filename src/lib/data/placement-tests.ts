/**
 * Placement mini-test: 6 questions of increasing difficulty (A1 → B2) per language pair.
 * Used to determine a new user's proficiency level (0..10).
 * Front is always in the user's native language, options — in the target language.
 */

export interface PlacementQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

export interface PlacementTest {
  pair: string;
  questions: PlacementQuestion[];
}

export const PLACEMENT_TESTS: Record<string, PlacementTest> = {
  // 1. RU -> UZ
  "ru-uz": {
    pair: "ru-uz",
    questions: [
      {
        text: "«Привет» — как будет по-узбекски?",
        options: ["Salom", "Rahmat", "Xayr", "Kechirasiz"],
        correctIndex: 0,
      },
      {
        text: "«Спасибо» — как будет по-узбекски?",
        options: ["Iltimos", "Rahmat", "Yordam", "Kechirasiz"],
        correctIndex: 1,
      },
      {
        text: "Как сказать «Сколько это стоит?»",
        options: ["Bu qayerda joylashgan?", "Bu nima?", "Bu qancha turadi?", "Bu kim?"],
        correctIndex: 2,
      },
      {
        text: "«Я не понял, повторите, пожалуйста» — выберите верный вариант",
        options: [
          "Menga yordam bering, iltimos",
          "Tushunmadim, qayta ayting, iltimos",
          "Bu juda qimmat",
          "Kechirasiz, men bandman",
        ],
        correctIndex: 1,
      },
      {
        text: "«Вчера мы ходили на базар» — как будет?",
        options: [
          "Ertaga biz bozorga boramiz",
          "Biz har kuni bozoramiz",
          "Kecha bozor yopiq edi",
          "Kecha biz bozorga bordik",
        ],
        correctIndex: 3,
      },
      {
        text: "«Если бы я знал, я бы пришёл раньше» — усложнённая конструкция",
        options: [
          "Bilsam, oldinroq kelardim",
          "Bilganim uchun keldim",
          "Bilsam, kelmayman",
          "Men bilmasdim, shuning uchun keldim",
        ],
        correctIndex: 0,
      },
    ],
  },

  // 2. RU -> EN
  "ru-en": {
    pair: "ru-en",
    questions: [
      {
        text: "«Спасибо» — как будет по-английски?",
        options: ["Good night", "Thank you", "You're welcome", "See you"],
        correctIndex: 1,
      },
      {
        text: "«Где находится станция?» — выберите верный вариант",
        options: [
          "What is the station?",
          "Who is at the station?",
          "Where is the station?",
          "When is the train?",
        ],
        correctIndex: 2,
      },
      {
        text: "«Я уже закончил работу» — настоящее совершённое время",
        options: [
          "I have already finished work",
          "I already finish work",
          "I am already finish work",
          "I had finish work",
        ],
        correctIndex: 0,
      },
      {
        text: "«Она сказала, что придёт завтра» — согласование времён",
        options: [
          "She says she come yesterday",
          "She said that she would come tomorrow",
          "She saying she will came tomorrow",
          "She said she comes every day",
        ],
        correctIndex: 1,
      },
      {
        text: "«Я никогда не был в Лондоне» — выберите верный вариант",
        options: [
          "I never be to London",
          "I am never being in London",
          "I have never been to London",
          "I have never gone London",
        ],
        correctIndex: 2,
      },
      {
        text: "«Если бы я знал, я бы позвонил тебе» — Third Conditional",
        options: [
          "If I knew, I will call you",
          "If I would know, I called you",
          "If I have known, I call you",
          "If I had known, I would have called you",
        ],
        correctIndex: 3,
      },
    ],
  },

  // 3. UZ -> RU
  "uz-ru": {
    pair: "uz-ru",
    questions: [
      {
        text: "«Salom» — что это значит?",
        options: ["Спасибо", "Здравствуйте", "До свидания", "Пожалуйста"],
        correctIndex: 1,
      },
      {
        text: "«Katta rahmat» — что это значит?",
        options: ["Большой пожалуйста", "Ничего страшного", "Большое спасибо", "Маленькое спасибо"],
        correctIndex: 2,
      },
      {
        text: "«Bu qancha turadi?» — как переводится?",
        options: ["Где это находится?", "Сколько это стоит?", "Кто это сделал?", "Что это такое?"],
        correctIndex: 1,
      },
      {
        text: "«Tushunmadim, qayta ayting» — выберите верный перевод",
        options: [
          "Я не знаю, скажите",
          "Повторите, я устал",
          "Я не понял, повторите",
          "Не понимаю, это дорого",
        ],
        correctIndex: 2,
      },
      {
        text: "«Kecha biz bozorga bordik» — как переводится?",
        options: [
          "Завтра мы пойдём на базар",
          "Вчера мы ходили на базар",
          "Вчера базар был закрыт",
          "Мы часто ходим на базар",
        ],
        correctIndex: 1,
      },
      {
        text: "«Bilsam, oldinroq kelardim» — усложнённая конструкция",
        options: [
          "Я не знал и пришёл позже",
          "Если бы я знал, я бы пришёл раньше",
          "Зная, я пришёл рано",
          "Если знаю, приду раньше",
        ],
        correctIndex: 1,
      },
    ],
  },

  // 4. UZ -> EN
  "uz-en": {
    pair: "uz-en",
    questions: [
      {
        text: "«Salom» — what does it mean?",
        options: ["Thanks", "Hello", "Goodbye", "Please"],
        correctIndex: 1,
      },
      {
        text: "«Katta rahmat» — what does it mean?",
        options: ["You are very welcome", "Good evening", "Thank you very much", "See you tomorrow"],
        correctIndex: 2,
      },
      {
        text: "«Bu qancha turadi?» — how to translate?",
        options: ["Where is this?", "Who made this?", "What is this?", "How much does this cost?"],
        correctIndex: 3,
      },
      {
        text: "«Tushunmadim, qayta ayting» — choose the correct translation",
        options: [
          "I do not know, tell me",
          "I did not understand, please say it again",
          "Please stop here",
          "It is too expensive",
        ],
        correctIndex: 1,
      },
      {
        text: "«Kecha biz bozorga bordik» — how to translate?",
        options: [
          "We go to the market every day",
          "The market was closed yesterday",
          "We went to the market yesterday",
          "We will go to the market tomorrow",
        ],
        correctIndex: 2,
      },
      {
        text: "«Bilsam, oldinroq kelardim» — advanced construction",
        options: [
          "When I know, I come early",
          "Knowing that, I came early",
          "If I had known, I would have come earlier",
          "If I knew, I will come earlier",
        ],
        correctIndex: 2,
      },
    ],
  },

  // 5. RU -> IT
  "ru-it": {
    pair: "ru-it",
    questions: [
      {
        text: "«Спасибо» — как будет по-итальянски?",
        options: ["Prego", "Grazie", "Ciao", "Scusi"],
        correctIndex: 1,
      },
      {
        text: "«Где находится станция?» — выберите верный вариант",
        options: ["Che ora è?", "Come va?", "Dov'è la stazione?", "Chi è?"],
        correctIndex: 2,
      },
      {
        text: "«Я хочу кофе» — как будет?",
        options: ["Voglio andare", "Voglio un caffè", "Sono un caffè", "Prendo il tè domani"],
        correctIndex: 1,
      },
      {
        text: "«Вчера мы были в Риме» — прошедшее время",
        options: ["Domani andiamo a Roma", "Siamo a Roma", "Ieri siamo stati a Roma", "Andiamo a Roma ieri"],
        correctIndex: 2,
      },
      {
        text: "«Я не понял, повторите» — выберите верный вариант",
        options: [
          "Non so, mi dica",
          "Ho capito, non ripeta",
          "Ripeta domani",
          "Non ho capito, ripeta, per favore",
        ],
        correctIndex: 3,
      },
      {
        text: "«Если бы я знал, я бы пришёл» — усложнённая конструкция",
        options: [
          "Se avessi saputo, sarei venuto",
          "Se sapevo, vengo",
          "Se so, sarei venuto",
          "Avendo saputo, vengo",
        ],
        correctIndex: 0,
      },
    ],
  },

  // 6. UZ -> IT
  "uz-it": {
    pair: "uz-it",
    questions: [
      {
        text: "«Salom» — nima degani?",
        options: ["Grazie", "Ciao", "Arrivederci", "Prego"],
        correctIndex: 1,
      },
      {
        text: "«Katta rahmat» — nima degani?",
        options: ["Mi scusi", "Buonasera", "Grazie mille", "Prego"],
        correctIndex: 2,
      },
      {
        text: "«Bu qancha turadi?» — qanday tarjima qilinadi?",
        options: ["Dov'è?", "Come va?", "Quanto costa?", "Chi è?"],
        correctIndex: 2,
      },
      {
        text: "«Kecha biz Romada edik» — o'tgan zamon",
        options: [
          "Domani andiamo a Roma",
          "Siamo a Roma",
          "Andiamo a Roma ieri",
          "Ieri siamo stati a Roma",
        ],
        correctIndex: 3,
      },
      {
        text: "«Tushunmadim, qayta ayting» — to'g'ri variantni tanlang",
        options: [
          "Non ho capito, ripeta, per favore",
          "Non so, mi dica",
          "Ho capito",
          "Ripeta domani",
        ],
        correctIndex: 0,
      },
      {
        text: "«Bilsam, kelardim» — murakkab tuzilma",
        options: [
          "Se so, vengo",
          "Se avessi saputo, sarei venuto",
          "Sapevo, venivo",
          "Se sapevo, vengo",
        ],
        correctIndex: 1,
      },
    ],
  },
};

/** Returns the placement test for a pair key (e.g. "ru-uz"), or null. */
export function getPlacementTest(pairKey: string): PlacementTest | null {
  return PLACEMENT_TESTS[pairKey.toLowerCase()] || null;
}

/** Maps raw score to proficiency level 0..10. */
export function scoreToLevel(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(10, Math.max(0, Math.round((score / total) * 10)));
}

/** Human-readable proficiency label. */
export function proficiencyLabel(level: number): string {
  if (level <= 1) return "Новичок";
  if (level <= 3) return "Начальный";
  if (level <= 5) return "Базовый";
  if (level <= 7) return "Средний";
  if (level <= 9) return "Уверенный";
  return "Продвинутый";
}
