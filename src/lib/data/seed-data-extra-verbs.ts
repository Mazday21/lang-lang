import type { SeedDeck } from "./seed-data";

export const EXTRA_VERBS: Record<string, SeedDeck[]> = {
  "ru-uz": [
    {
      title: "Топ-14 глаголов повседневной речи",
      description: "Фундаментальные глаголы в неопределённой форме (-moq) и 1-м лице",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      level: 1,
      cards: [
        {
          front: "делать",
          back: "qilmoq",
          rule_description: "Men qilaman — я делаю (или сделаю). Главный вспомогательный глагол для составных слов (ish qilmoq, telefon qilmoq).",
        },
        {
          front: "говорить",
          back: "gapirmoq",
          rule_description: "Men gapiraman — я говорю. Слово «gap» означает «слово / речь / дело».",
        },
        {
          front: "идти / ехать (туда)",
          back: "bormoq",
          rule_description: "Men boraman — я иду/поеду (по направлению от говорящего).",
        },
        {
          front: "приходить / приезжать (сюда)",
          back: "kelmoq",
          rule_description: "Men kelaman — я приду/приеду (по направлению к говорящему).",
        },
        {
          front: "брать / получать",
          back: "olmoq",
          rule_description: "Men olaman — я беру. Также работает как вспомогательный глагол способности (qila olaman — могу сделать).",
        },
        {
          front: "давать",
          back: "bermoq",
          rule_description: "Men beraman — я даю. В связке с другим глаголом означает действие в пользу другого (yozib bering — напишите мне).",
        },
        {
          front: "есть (кушать) и пить",
          back: "yemoq va ichmoq",
          rule_description: "Men yeyman (я ем), men ichaman (я пью).",
        },
        {
          front: "думать",
          back: "o'ylamoq",
          rule_description: "Men o'ylayman — я думаю.",
        },
        {
          front: "читать / учиться",
          back: "o'qimoq",
          rule_description: "Men o'qiyman — я читаю / я учусь.",
        },
        {
          front: "писать",
          back: "yozmoq",
          rule_description: "Men yozaman — я пишу.",
        },
        {
          front: "работать",
          back: "ishlamoq",
          rule_description: "Men ishlayman — я работаю (от «ish» — работа).",
        },
        {
          front: "жить",
          back: "yashamoq",
          rule_description: "Men yashayman — я живу.",
        },
        {
          front: "любить (нравиться)",
          back: "yaxshi ko'rmoq (sevmoq)",
          rule_description: "Sevmoq — романтическое «любить»; в быту («люблю плов/читать») всегда говорят «yaxshi ko'rmoq» (букв. «хорошо видеть»).",
        },
        {
          front: "покупать",
          back: "sotib olmoq",
          rule_description: "Буквально «продав брать»: sotmoq (продавать) -> sotib olmoq (покупать).",
        },
      ],
    },
  ],
  "ru-en": [
    {
      title: "Топ-12 глаголов повседневной речи",
      description: "Часто употребляемые глаголы: делать, говорить, читать и другие",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      level: 1,
      cards: [
        {
          front: "делать",
          back: "do",
          rule_description: "Do (делать): I do — я делаю.",
        },
        {
          front: "говорить",
          back: "speak",
          rule_description: "Speak (говорить): I speak — я говорю.",
        },
        {
          front: "приходить",
          back: "come",
          rule_description: "Come (приходить): I come — я прихожу.",
        },
        {
          front: "думать",
          back: "think",
          rule_description: "Think (думать): I think — я думаю.",
        },
        {
          front: "брать",
          back: "take",
          rule_description: "Take (брать): I take — я беру.",
        },
        {
          front: "давать",
          back: "give",
          rule_description: "Give (давать): I give — я даю.",
        },
        {
          front: "читать",
          back: "read",
          rule_description: "Read (читать): I read — я читаю; читается как «рид».",
        },
        {
          front: "писать",
          back: "write",
          rule_description: "Write (писать): I write — я пишу.",
        },
        {
          front: "работать",
          back: "work",
          rule_description: "Work (работать): I work — я работаю.",
        },
        {
          front: "жить",
          back: "live",
          rule_description: "Live (жить): I live — я живу.",
        },
        {
          front: "любить",
          back: "love",
          rule_description: "Love (любить): I love — я люблю.",
        },
        {
          front: "покупать",
          back: "buy",
          rule_description: "Buy (покупать): I buy — я покупаю; читается как «бай».",
        },
      ],
    },
  ],
  "uz-ru": [
    {
      title: "Kundalik nutqning 12 asosiy fe'li",
      description: "Ko'p ishlatiladigan fe'llar: qilmoq, gapirmoq, o'qimoq va boshqalar",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      level: 1,
      cards: [
        {
          front: "qilmoq",
          back: "делать",
          rule_description: "Qilmoq (делать): men qilaman — я делаю.",
        },
        {
          front: "gapirmoq",
          back: "говорить",
          rule_description: "Gapirmoq (говорить): men gapiraman — я говорю.",
        },
        {
          front: "kelmoq",
          back: "приходить",
          rule_description: "Kelmoq (приходить): men kelaman — я прихожу.",
        },
        {
          front: "o'ylamoq",
          back: "думать",
          rule_description: "O'ylamoq (думать): men o'ylayman — я думаю.",
        },
        {
          front: "olmoq",
          back: "брать",
          rule_description: "Olmoq (брать): men olaman — я беру.",
        },
        {
          front: "bermoq",
          back: "давать",
          rule_description: "Bermoq (давать): men beraman — я даю.",
        },
        {
          front: "o'qimoq",
          back: "читать",
          rule_description: "O'qimoq (читать): men o'qiyman — я читаю.",
        },
        {
          front: "yozmoq",
          back: "писать",
          rule_description: "Yozmoq (писать): men yozaman — я пишу.",
        },
        {
          front: "ishlamoq",
          back: "работать",
          rule_description: "Ishlamoq (работать): men ishlayman — я работаю.",
        },
        {
          front: "yashamoq",
          back: "жить",
          rule_description: "Yashamoq (жить): men yashayman — я живу.",
        },
        {
          front: "sevmoq",
          back: "любить",
          rule_description: "Sevmoq (любить): men sevaman — я люблю.",
        },
        {
          front: "sotib olmoq",
          back: "покупать",
          rule_description: "Sotib olmoq (покупать): men sotib olaman — я покупаю.",
        },
      ],
    },
  ],
  "uz-en": [
    {
      title: "Kundalik nutqning 12 asosiy fe'li",
      description: "Ko'p ishlatiladigan fe'llar: qilmoq, gapirmoq, o'qimoq va boshqalar",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      level: 1,
      cards: [
        {
          front: "qilmoq",
          back: "do",
          rule_description: "Do (qilmoq): I do — men qilaman.",
        },
        {
          front: "gapirmoq",
          back: "speak",
          rule_description: "Speak (gapirmoq): I speak — men gapiraman.",
        },
        {
          front: "kelmoq",
          back: "come",
          rule_description: "Come (kelmoq): I come — men kelaman.",
        },
        {
          front: "o'ylamoq",
          back: "think",
          rule_description: "Think (o'ylamoq): I think — men o'ylayman.",
        },
        {
          front: "olmoq",
          back: "take",
          rule_description: "Take (olmoq): I take — men olaman.",
        },
        {
          front: "bermoq",
          back: "give",
          rule_description: "Give (bermoq): I give — men beraman.",
        },
        {
          front: "o'qimoq",
          back: "read",
          rule_description: "Read (o'qimoq): I read — men o'qiyman; «rid» deb o'qiladi.",
        },
        {
          front: "yozmoq",
          back: "write",
          rule_description: "Write (yozmoq): I write — men yozaman.",
        },
        {
          front: "ishlamoq",
          back: "work",
          rule_description: "Work (ishlamoq): I work — men ishlayman.",
        },
        {
          front: "yashamoq",
          back: "live",
          rule_description: "Live (yashamoq): I live — men yashayman.",
        },
        {
          front: "sevmoq",
          back: "love",
          rule_description: "Love (sevmoq): I love — men sevaman.",
        },
        {
          front: "sotib olmoq",
          back: "buy",
          rule_description: "Buy (sotib olmoq): I buy — men sotib olaman; «bay» deb o'qiladi.",
        },
      ],
    },
  ],
  "ru-it": [
    {
      title: "Топ-12 глаголов повседневной речи",
      description: "Часто употребляемые глаголы: делать, говорить, читать и другие",
      native_language: "ru",
      target_language: "it",
      language_pair: "ru-it",
      level: 1,
      cards: [
        {
          front: "делать",
          back: "fare",
          rule_description: "Fare (делать): io faccio — я делаю.",
        },
        {
          front: "говорить",
          back: "dire",
          rule_description: "Dire (говорить): io dico — я говорю.",
        },
        {
          front: "приходить",
          back: "venire",
          rule_description: "Venire (приходить): io vengo — я прихожу.",
        },
        {
          front: "думать",
          back: "pensare",
          rule_description: "Pensare (думать): io penso — я думаю.",
        },
        {
          front: "брать",
          back: "prendere",
          rule_description: "Prendere (брать): io prendo — я беру.",
        },
        {
          front: "давать",
          back: "dare",
          rule_description: "Dare (давать): io do — я даю.",
        },
        {
          front: "читать",
          back: "leggere",
          rule_description: "Leggere (читать): io leggo — я читаю.",
        },
        {
          front: "писать",
          back: "scrivere",
          rule_description: "Scrivere (писать): io scrivo — я пишу.",
        },
        {
          front: "работать",
          back: "lavorare",
          rule_description: "Lavorare (работать): io lavoro — я работаю.",
        },
        {
          front: "жить",
          back: "vivere",
          rule_description: "Vivere (жить): io vivo — я живу.",
        },
        {
          front: "любить",
          back: "amare",
          rule_description: "Amare (любить): io amo — я люблю.",
        },
        {
          front: "покупать",
          back: "comprare",
          rule_description: "Comprare (покупать): io compro — я покупаю.",
        },
      ],
    },
  ],
  "uz-it": [
    {
      title: "Kundalik nutqning 12 asosiy fe'li",
      description: "Ko'p ishlatiladigan fe'llar: qilmoq, gapirmoq, o'qimoq va boshqalar",
      native_language: "uz",
      target_language: "it",
      language_pair: "uz-it",
      level: 1,
      cards: [
        {
          front: "qilmoq",
          back: "fare",
          rule_description: "Fare (qilmoq): io faccio — men qilaman.",
        },
        {
          front: "gapirmoq",
          back: "dire",
          rule_description: "Dire (gapirmoq): io dico — men gapiraman.",
        },
        {
          front: "kelmoq",
          back: "venire",
          rule_description: "Venire (kelmoq): io vengo — men kelaman.",
        },
        {
          front: "o'ylamoq",
          back: "pensare",
          rule_description: "Pensare (o'ylamoq): io penso — men o'ylayman.",
        },
        {
          front: "olmoq",
          back: "prendere",
          rule_description: "Prendere (olmoq): io prendo — men olaman.",
        },
        {
          front: "bermoq",
          back: "dare",
          rule_description: "Dare (bermoq): io do — men beraman.",
        },
        {
          front: "o'qimoq",
          back: "leggere",
          rule_description: "Leggere (o'qimoq): io leggo — men o'qiyman.",
        },
        {
          front: "yozmoq",
          back: "scrivere",
          rule_description: "Scrivere (yozmoq): io scrivo — men yozaman.",
        },
        {
          front: "ishlamoq",
          back: "lavorare",
          rule_description: "Lavorare (ishlamoq): io lavoro — men ishlayman.",
        },
        {
          front: "yashamoq",
          back: "vivere",
          rule_description: "Vivere (yashamoq): io vivo — men yashayman.",
        },
        {
          front: "sevmoq",
          back: "amare",
          rule_description: "Amare (sevmoq): io amo — men sevaman.",
        },
        {
          front: "sotib olmoq",
          back: "comprare",
          rule_description: "Comprare (sotib olmoq): io compro — men sotib olaman.",
        },
      ],
    },
  ],
};
