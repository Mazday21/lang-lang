export interface SeedCard {
  front: string;
  back: string;
  rule_description: string;
}

export interface SeedDeck {
  title: string;
  description: string;
  native_language: string;
  target_language: string;
  language_pair: string;
  cards: SeedCard[];
}

export const STARTER_DECKS: Record<string, SeedDeck[]> = {
  // 1. RU -> UZ
  "ru-uz": [
    {
      title: "Базовые фразы и приветствия",
      description: "Самые нужные фразы для вежливого общения и первого знакомства",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      cards: [
        {
          front: "Привет / Здравствуйте",
          back: "Salom / Assalomu alaykum",
          rule_description: "Salom — неформальное приветствие; Assalomu alaykum — вежливая традиционная форма.",
        },
        {
          front: "Спасибо большое",
          back: "Katta rahmat",
          rule_description: "Katta (большой/очень) + rahmat (спасибо).",
        },
        {
          front: "До свидания, до встречи",
          back: "Xayr, ko'rishguncha",
          rule_description: "Xayr (до свидания) + ko'rish- (видеться) + -guncha (до тех пор, пока).",
        },
        {
          front: "Как ваши дела?",
          back: "Ishlaringiz qalay?",
          rule_description: "Ishlar (дела) + -ingiz (ваши, вежл.) + qalay (как). Либо разговорное: Qandaysiz?",
        },
        {
          front: "Пожалуйста (не за что)",
          back: "Arzimaydi",
          rule_description: "Arzi- (стоить) + -maydi (отрицание 3 л. наст. времени: 'не стоит благодарности').",
        },
      ],
    },
    {
      title: "Числа и покупки",
      description: "Счет, вопросы о ценах и общение на рынке Чорсу",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      cards: [
        {
          front: "Один, два, три, четыре, пять",
          back: "Bir, ikki, uch, to'rt, besh",
          rule_description: "Базовый счет: Bir (1), Ikki (2), Uch (3), To'rt (4), Besh (5).",
        },
        {
          front: "Сколько это стоит?",
          back: "Bu qancha turadi?",
          rule_description: "Bu (это) + qancha (сколько) + turadi (стоит / обходится).",
        },
        {
          front: "Сделайте немного дешевле",
          back: "Biroz arzonroq qilib bering",
          rule_description: "Arzon (дешевый) + -roq (сравн. степень) + qilib bering (сделайте/уступите).",
        },
        {
          front: "Это очень дорого",
          back: "Bu juda qimmat",
          rule_description: "Juda (очень) + qimmat (дорогой/дорого).",
        },
        {
          front: "Дайте пакет, пожалуйста",
          back: "Iltimos, paket bering",
          rule_description: "Iltimos (пожалуйста) + paket + ber- (дать) + -ing (повелительное вежливое).",
        },
      ],
    },
    {
      title: "Ориентация в городе и такси",
      description: "Фразы для передвижения по Ташкенту, метро и вызова такси",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      cards: [
        {
          front: "Где находится метро?",
          back: "Metro qayerda joylashgan?",
          rule_description: "Qayerda (где) + joylashgan (расположено/находится).",
        },
        {
          front: "Остановите здесь, пожалуйста",
          back: "Shu yerda to'xtating, iltimos",
          rule_description: "Shu yerda (вот здесь) + to'xtat- (останавливать) + -ing (вежливое окончание).",
        },
        {
          front: "Поверните направо",
          back: "O'ngga buring",
          rule_description: "O'ng (правый) + -ga (направительный падеж: вправо) + bur- (поворачивать).",
        },
        {
          front: "Поверните налево",
          back: "Chapga buring",
          rule_description: "Chap (левый) + -ga (направительный падеж: влево) + bur- (поворачивать).",
        },
        {
          front: "Езжайте прямо",
          back: "To'g'riga haydang",
          rule_description: "To'g'ri (прямо) + -ga (направление) + hayda- (водить/ехать).",
        },
      ],
    },
  ],

  // 2. RU -> EN
  "ru-en": [
    {
      title: "Essential Phrases & Greetings",
      description: "Базовые фразы вежливости, приветствия и повседневный этикет",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      cards: [
        {
          front: "Привет, как поживаешь?",
          back: "Hello, how are you?",
          rule_description: "Стандартное вежливое приветствие и вопрос о самочувствии.",
        },
        {
          front: "Большое спасибо за помощь",
          back: "Thank you so much for your help",
          rule_description: "Конструкция благодарности Thank you for + существительное your help.",
        },
        {
          front: "Пожалуйста / Не за что",
          back: "You are welcome",
          rule_description: "Наиболее естественный и вежливый ответ на благодарность в английском.",
        },
        {
          front: "Приятно познакомиться",
          back: "Nice to meet you",
          rule_description: "Устойчивая фраза этикета при первом знакомстве.",
        },
        {
          front: "Хорошего дня, до свидания",
          back: "Have a nice day, goodbye",
          rule_description: "Have a nice day — популярная доброжелательная фраза прощания.",
        },
      ],
    },
    {
      title: "Numbers & Shopping",
      description: "Счет, покупки в магазинах и вопросы о цене",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      cards: [
        {
          front: "Сколько это стоит?",
          back: "How much does this cost?",
          rule_description: "How much + вспомогательный глагол does + глагол cost (или 'How much is this?').",
        },
        {
          front: "Это слишком дорого",
          back: "This is too expensive",
          rule_description: "Too (слишком, усилитель) + прилагательное expensive (дорогой).",
        },
        {
          front: "Есть ли у вас размер поменьше?",
          back: "Do you have a smaller size?",
          rule_description: "Сравнительная степень прилагательного small -> smaller.",
        },
        {
          front: "Могу я оплатить картой?",
          back: "Can I pay by card?",
          rule_description: "Модальный глагол Can I... + устойчивое выражение pay by card.",
        },
        {
          front: "Мне это нравится, я беру",
          back: "I like it, I will take it",
          rule_description: "Future Simple (will take) для спонтанного решения в момент речи.",
        },
      ],
    },
    {
      title: "Travel & Navigation",
      description: "Навигация в городе, аэропорту, отелях и такси",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      cards: [
        {
          front: "Где находится ближайшая станция?",
          back: "Where is the nearest station?",
          rule_description: "Превосходная степень прилагательного near -> the nearest.",
        },
        {
          front: "Поверните налево на перекрестке",
          back: "Turn left at the intersection",
          rule_description: "Повелительное наклонение Turn left + предлог места at.",
        },
        {
          front: "Остановите здесь, пожалуйста",
          back: "Stop here, please",
          rule_description: "Фраза обращения к водителю с вежливой частицей please.",
        },
        {
          front: "Как мне добраться до центра?",
          back: "How do I get to the center?",
          rule_description: "Устойчивая конструкция How do I get to... (Как добраться до...).",
        },
        {
          front: "Я потерялся, помогите, пожалуйста",
          back: "I am lost, please help me",
          rule_description: "Выражение to be lost (заблудиться / потеряться).",
        },
      ],
    },
  ],

  // 3. UZ -> RU
  "uz-ru": [
    {
      title: "Asosiy iboralar va salomlashish",
      description: "Kundalik muloqot va xushmuomalalik iboralari",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      cards: [
        {
          front: "Salom, qalaysiz?",
          back: "Привет, как дела?",
          rule_description: "Do'stona va norasmiy salomlashish shakli.",
        },
        {
          front: "Katta rahmat",
          back: "Большое спасибо",
          rule_description: "Minnatdorchilik bildirishning universal va samimiy iborasi.",
        },
        {
          front: "Arzimaydi (rahmatga javob)",
          back: "Пожалуйста, не за что",
          rule_description: "Minnatdorchilikka xushmuomalalik bilan javob berish.",
        },
        {
          front: "Xayr, ko'rishguncha",
          back: "До свидания, до встречи",
          rule_description: "Xayrlashuv vaqtida ishlatiladigan odobli ibora.",
        },
        {
          front: "Tanishganimdan juda xursandman",
          back: "Очень приятно познакомиться",
          rule_description: "Yangi inson bilan tanishganda aytiladigan odob qoidasi.",
        },
      ],
    },
    {
      title: "Raqamlar va xaridlar",
      description: "Narx-navo so'rash va do'konlarda erkin xarid qilish",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      cards: [
        {
          front: "Bu qancha turadi?",
          back: "Сколько это стоит?",
          rule_description: "Har qanday narsaning narxini bilish uchun asosiy savol.",
        },
        {
          front: "Biroz arzonroq qilib bering",
          back: "Сделайте немного дешевле",
          rule_description: "Chegirma (skidka) so'rash iborasi.",
        },
        {
          front: "Karta orqali to'lasam bo'ladimi?",
          back: "Можно оплатить картой?",
          rule_description: "Naqdsiz to'lov imkoniyatini aniqlashtirish.",
        },
        {
          front: "Bu juda qimmat",
          back: "Это слишком дорого",
          rule_description: "Слишком (haddan tashqari) + дорого (qimmat).",
        },
        {
          front: "Menga chekni bering, iltimos",
          back: "Дайте чек, пожалуйста",
          rule_description: "Xarid tasdig'ini so'rash shakli.",
        },
      ],
    },
    {
      title: "Shahar va transport",
      description: "Shaharda yo'l so'rash, metro va taksida harakatlanish",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      cards: [
        {
          front: "Metro qayerda joylashgan?",
          back: "Где находится метро?",
          rule_description: "Joylashuvni so'rash uchun 'Где находится...' iborasi.",
        },
        {
          front: "Iltimos, shu yerda to'xtating",
          back: "Остановите здесь, пожалуйста",
          rule_description: "Taksi haydovchisiga manzilga yetganda murojaat qilish.",
        },
        {
          front: "O'ngga buriling",
          back: "Поверните направо",
          rule_description: "Направо — o'ng tarafga harakatlanish yo'nalishi.",
        },
        {
          front: "Chapga buriling",
          back: "Поверните налево",
          rule_description: "Налево — chap tarafga harakatlanish yo'nalishi.",
        },
        {
          front: "To'g'riga haydang / yuring",
          back: "Езжайте прямо",
          rule_description: "Прямо — to'g'ri yo'nalish bo'yicha yurish.",
        },
      ],
    },
  ],

  // 4. UZ -> EN
  "uz-en": [
    {
      title: "Everyday Greetings & Basics",
      description: "Essential phrases for everyday communication",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      cards: [
        {
          front: "Salom, ishlaringiz qalay?",
          back: "Hello, how are you doing?",
          rule_description: "Kundalik do'stona salomlashish va hol-ahvol so'rash.",
        },
        {
          front: "Yordamingiz uchun katta rahmat",
          back: "Thank you so much for your help",
          rule_description: "Yordam bergan mehmondo'st insonlarga minnatdorchilik bildirish.",
        },
        {
          front: "Arzimaydi",
          back: "You are welcome",
          rule_description: "Thank you iborasiga beriladigan eng xushmuomala javob.",
        },
        {
          front: "Kuningiz xayrli o'tsin",
          back: "Have a nice day",
          rule_description: "Kunning xayrli o'tishini tilab xayrlashish iborasi.",
        },
        {
          front: "Kechirasiz, men tushunmadim",
          back: "Excuse me, I did not understand",
          rule_description: "Tushunarsiz vaziyatda qayta so'rash odobi.",
        },
      ],
    },
    {
      title: "Shopping & Numbers",
      description: "Asking prices and buying items abroad",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      cards: [
        {
          front: "Bu qancha turadi?",
          back: "How much is this?",
          rule_description: "Har qanday do'konda narx so'rashning eng oson usuli.",
        },
        {
          front: "Chegirma qilib berasizmi?",
          back: "Can you give me a discount?",
          rule_description: "Muloyim shaklda chegirma (discount) so'rash.",
        },
        {
          front: "Naqd pulda to'layman",
          back: "I will pay in cash",
          rule_description: "In cash — naqd pul orqali to'lov ma'nosida.",
        },
        {
          front: "Boshqa o'lchami bormi?",
          back: "Do you have another size?",
          rule_description: "Kiyim yoki poyabzal o'lchamini so'rash.",
        },
        {
          front: "Menga bu yoqdi, sotib olaman",
          back: "I like it, I will take it",
          rule_description: "Xarid qilish to'g'risidagi qat'iy qaror.",
        },
      ],
    },
    {
      title: "Travel & City Direction",
      description: "Directions, taxi and airport communication",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      cards: [
        {
          front: "Bu manzilga qanday borsam bo'ladi?",
          back: "How can I get to this address?",
          rule_description: "Xaritadagi joy yoki manzilga borish yo'lini so'rash.",
        },
        {
          front: "Iltimos, shu yerda to'xtating",
          back: "Please stop here",
          rule_description: "Taksini to'xtatish uchun oddiy va tushunarli buyruq.",
        },
        {
          front: "Chipta qayerda sotiladi?",
          back: "Where can I buy a ticket?",
          rule_description: "Poyezd, avtobus yoki samolyot chiptasi haqida so'rash.",
        },
        {
          front: "O'ng tomonda joylashgan",
          back: "It is on the right side",
          rule_description: "On the right side — o'ng tomonda.",
        },
        {
          front: "Chap tomonda joylashgan",
          back: "It is on the left side",
          rule_description: "On the left side — chap tomonda.",
        },
      ],
    },
  ],
};

// Fallback legacy export
export const SEED_DECKS = STARTER_DECKS["ru-uz"];
