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
  level: number;
  cards: SeedCard[];
}

export const STARTER_DECKS: Record<string, SeedDeck[]> = {
  // 1. RU -> UZ
  "ru-uz": [
    {
      title: "Грамматика: прошедшее время",
      description: "Углублённое изучение: глаголы прошедшего времени (-di) и отрицание",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      level: 3,
      cards: [
        {
          front: "Я сделал",
          back: "Men qildim",
          rule_description: "Прошедшее время -di: qil + di + m (1-е лицо ед. ч.).",
        },
        {
          front: "Ты пошёл",
          back: "Sen bording",
          rule_description: "Bormoq: bor + di + ng (2-е лицо ед. ч.).",
        },
        {
          front: "Она прочитала",
          back: "U o'qidi",
          rule_description: "O'qimoq: o'qi + di (3-е лицо без личного окончания).",
        },
        {
          front: "Мы были",
          back: "Biz edik",
          rule_description: "Связка быть в прошлом: edi + k (1-е лицо мн. ч.).",
        },
        {
          front: "Я не понял",
          back: "Tushunmadim",
          rule_description: "Отрицание -ma- ставится перед -di: tushun + ma + di + m.",
        },
        {
          front: "Что случилось?",
          back: "Nima bo'ldi?",
          rule_description: "Устойчивый вопрос: nima (что) + bo'ldi (стало/случилось).",
        },
      ],
    },
    {
      title: "Эмоции и устойчивые выражения",
      description: "Углублённое изучение: чувства, характер и популярные идиомы",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      level: 3,
      cards: [
        {
          front: "Я рад",
          back: "Men xursandman",
          rule_description: "Xursand (рад) + связка -man («я есть»).",
        },
        {
          front: "Я устал",
          back: "Charchadim",
          rule_description: "Charchamoq (уставать) в прошедшем времени: charcha + di + m.",
        },
        {
          front: "Не переживайте!",
          back: "Xavotir olmang!",
          rule_description: "Xavotir olmoq — «переживать» (букв. «брать тревогу»); olmang — вежливый запрет.",
        },
        {
          front: "Держать слово",
          back: "So'zida turmoq",
          rule_description: "Идиома: букв. «стоять на своём слове» — сдерживать обещание.",
        },
        {
          front: "Ломать голову",
          back: "Bosh qotirmoq",
          rule_description: "Идиома: букв. «вскипятить голову» — много думать, решать задачу.",
        },
        {
          front: "Как скажешь",
          back: "Xo'p, xohlaganingizdek",
          rule_description: "Xo'p (ладно) + xohlaganingizdek (как хотите/скажете).",
        },
      ],
    },
    {
      title: "Еда и продукты",
      description: "Продукты питания, заказ еды и базовая лексика кухни",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      level: 2,
      cards: [
        {
          front: "Хлеб",
          back: "Non",
          rule_description: "Non (хлеб) — почётное слово: узбекский лаваш не режут ножом и не кладут вверх дном.",
        },
        {
          front: "Мясо",
          back: "Go'sht",
          rule_description: "Go'sht (мясо): «mol go'shti» — говядина, «qo'y go'shti» — баранина.",
        },
        {
          front: "Молоко и вода",
          back: "Sut va suv",
          rule_description: "Sut (молоко), suv (вода).",
        },
        {
          front: "Чай",
          back: "Choy",
          rule_description: "«Ko'k choy» — зелёный чай, традиционный напиток в Узбекистане.",
        },
        {
          front: "Я проголодался",
          back: "Ochdim",
          rule_description: "Лит. «открылся»: ochdim — разговорный способ сказать «хочу есть».",
        },
        {
          front: "Очень вкусно!",
          back: "Juda mazali!",
          rule_description: "Juda (очень) + mazali (вкусный).",
        },
      ],
    },
    {
      title: "Время и вопросительные слова",
      description: "Дни, время и ключевые слова для вопросов",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      level: 2,
      cards: [
        {
          front: "Сегодня",
          back: "Bugun",
          rule_description: "Bugun (сегодня); «bugun kechqurun» — сегодня вечером.",
        },
        {
          front: "Завтра",
          back: "Ertaga",
          rule_description: "Ertaga (завтра); «ertalab» — утром.",
        },
        {
          front: "Вчера",
          back: "Kecha",
          rule_description: "Kecha (вчера); «kecha kechqurun» — вчера вечером.",
        },
        {
          front: "Кто?",
          back: "Kim?",
          rule_description: "Kim — кто (о человеке).",
        },
        {
          front: "Когда?",
          back: "Qachon?",
          rule_description: "Qachon — когда (о времени).",
        },
        {
          front: "Почему?",
          back: "Nima uchun?",
          rule_description: "Буквально «для чего»: nima (что) + uchun (для).",
        },
      ],
    },
    {
      title: "Цвета и признаки",
      description: "Основные цвета и противоположные признаки для описания предметов",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      level: 1,
      cards: [
        {
          front: "Красный цвет",
          back: "Qizil rang",
          rule_description: "Qizil (красный) + rang (цвет).",
        },
        {
          front: "Синий / голубой",
          back: "Ko'k",
          rule_description: "Ko'k покрывает и синий, и голубой; уточняют «och ko'k» (голубой).",
        },
        {
          front: "Жёлтый и зелёный",
          back: "Sariq va yashil",
          rule_description: "Sariq (жёлтый) + va (и) + yashil (зелёный).",
        },
        {
          front: "Белый и чёрный",
          back: "Oq va qora",
          rule_description: "Oq (белый), qora (чёрный) — базовая пара противоположностей.",
        },
        {
          front: "Большой и маленький",
          back: "Katta va kichik",
          rule_description: "Katta (большой), kichik (маленький); «kichkina» — разговорный вариант.",
        },
        {
          front: "Хороший / плохой",
          back: "Yaxshi / yomon",
          rule_description: "Универсальные оценки качества: yaxshi (хороший), yomon (плохой).",
        },
      ],
    },
    {
      title: "Частые глаголы и местоимения",
      description: "Самые употребимые глаголы и местоимения для базовых фраз",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      level: 1,
      cards: [
        {
          front: "Я хочу",
          back: "Men xohlayman",
          rule_description: "Men (я) + xohlamoq (хотеть): xohla-y-man — настоящее время, 1-е лицо.",
        },
        {
          front: "Ты знаешь?",
          back: "Sen bilasanmi?",
          rule_description: "Bilmoq (знать) + -san (2-е лицо) + -mi (вопросительная частица).",
        },
        {
          front: "Мы идём / едем",
          back: "Biz boryapmiz",
          rule_description: "Bormoq (идти) + -yapmiz (настоящее длительное, 1-е лицо мн.).",
        },
        {
          front: "Я вижу",
          back: "Men ko'ryapman",
          rule_description: "Ko'rmoq (видеть) + -yapman (настоящее время).",
        },
        {
          front: "Я не знаю",
          back: "Bilmayman",
          rule_description: "Отрицание через -ma- перед окончанием: bil-ma-y-man.",
        },
        {
          front: "Вы понимаете?",
          back: "Tushunyapsizmi?",
          rule_description: "Tushunmoq (понимать) + -siz (вежливое «вы») + -mi (вопрос).",
        },
      ],
    },
    {
      title: "Базовые фразы и приветствия",
      description: "Самые нужные фразы для вежливого общения и первого знакомства",
      native_language: "ru",
      target_language: "uz",
      language_pair: "ru-uz",
      level: 1,
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
      level: 1,
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
      level: 2,
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
      title: "Грамматика: прошедшее время",
      description: "Углублённое изучение: Past Simple правильных и неправильных глаголов",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      level: 3,
      cards: [
        {
          front: "Я сделал",
          back: "I did",
          rule_description: "Прошедшее время правильных глаголов: глагол + -ed (worked, played).",
        },
        {
          front: "Ты пошёл",
          back: "You went",
          rule_description: "Неправильный глагол: go — went — gone.",
        },
        {
          front: "Она прочитала",
          back: "She read",
          rule_description: "read в прошлом читается как «red» — совпадает с цветом red.",
        },
        {
          front: "Мы были",
          back: "We were",
          rule_description: "to be в прошлом: I/he/she/it — was, you/we/they — were.",
        },
        {
          front: "Я не понял",
          back: "I didn't understand",
          rule_description: "Отрицание: didn't + инфинитив без to.",
        },
        {
          front: "Что случилось?",
          back: "What happened?",
          rule_description: "happen (случаться) — правильный глагол: happened.",
        },
      ],
    },
    {
      title: "Эмоции и устойчивые выражения",
      description: "Углублённое изучение: чувства, характер и английские идиомы",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      level: 3,
      cards: [
        {
          front: "Я рад",
          back: "I am glad",
          rule_description: "glad (рад); «I'm glad to hear it» — рад это слышать.",
        },
        {
          front: "Я устал",
          back: "I am tired",
          rule_description: "tired (уставший) + to be: «I'm tired».",
        },
        {
          front: "Не переживайте!",
          back: "Don't worry!",
          rule_description: "Don't worry — букв. «не волнуйтесь».",
        },
        {
          front: "Держать слово",
          back: "To keep one's word",
          rule_description: "Идиома: keep (держать) + one's word (чье-то слово) — сдерживать обещание.",
        },
        {
          front: "Ломать голову",
          back: "To rack one's brains",
          rule_description: "Идиома: букв. «трясти мозги» — много думать, решать задачу.",
        },
        {
          front: "Как скажешь",
          back: "Whatever you say",
          rule_description: "Разговорный вариант «как скажешь / как хочешь».",
        },
      ],
    },
    {
      title: "Еда и продукты",
      description: "Продукты питания, заказ еды и базовая лексика кухни",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      level: 2,
      cards: [
        {
          front: "Хлеб",
          back: "Bread",
          rule_description: "Uncountable: «a loaf of bread» — буханка хлеба.",
        },
        {
          front: "Мясо",
          back: "Meat",
          rule_description: "«beef» — говядина, «chicken» — курица, «pork» — свинина.",
        },
        {
          front: "Молоко и вода",
          back: "Milk and water",
          rule_description: "Uncountable — употребляются без артикля в общем значении.",
        },
        {
          front: "Чай?",
          back: "Would you like some tea?",
          rule_description: "Вежливое предложение: Would you like + some + напиток.",
        },
        {
          front: "Я проголодался",
          back: "I am hungry",
          rule_description: "hungry (голодный) + to be: «I'm hungry».",
        },
        {
          front: "Очень вкусно!",
          back: "It's very delicious!",
          rule_description: "delicious (вкусный) — сильный синоним tasty.",
        },
      ],
    },
    {
      title: "Время и вопросительные слова",
      description: "Дни, время и ключевые слова для вопросов",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      level: 2,
      cards: [
        {
          front: "Сегодня",
          back: "Today",
          rule_description: "today (сегодня), tomorrow (завтра), yesterday (вчера).",
        },
        {
          front: "Завтра",
          back: "Tomorrow",
          rule_description: "tomorrow (завтра) — без предлога: «see you tomorrow».",
        },
        {
          front: "Вчера",
          back: "Yesterday",
          rule_description: "yesterday (вчера) + прошедшее время: «I went yesterday».",
        },
        {
          front: "Кто?",
          back: "Who?",
          rule_description: "Who — кто (подлежащее), whom — кого (дополнение).",
        },
        {
          front: "Когда?",
          back: "When?",
          rule_description: "When — когда (о времени).",
        },
        {
          front: "Почему?",
          back: "Why?",
          rule_description: "Ответ часто через because (потому что).",
        },
      ],
    },
    {
      title: "Цвета и признаки",
      description: "Основные цвета и противоположные признаки для описания предметов",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      level: 1,
      cards: [
        {
          front: "Красный цвет",
          back: "Red",
          rule_description: "Red (красный); «red color» — красный цвет.",
        },
        {
          front: "Синий / голубой",
          back: "Blue",
          rule_description: "Blue покрывает и синий, и голубой; «light blue» — голубой.",
        },
        {
          front: "Жёлтый и зелёный",
          back: "Yellow and green",
          rule_description: "and — союз «и».",
        },
        {
          front: "Белый и чёрный",
          back: "White and black",
          rule_description: "Базовая пара противоположных цветов.",
        },
        {
          front: "Большой и маленький",
          back: "Big and small",
          rule_description: "Big/small; «large» — более формальный синоним big.",
        },
        {
          front: "Хороший / плохой",
          back: "Good / bad",
          rule_description: "Универсальные оценки качества.",
        },
      ],
    },
    {
      title: "Частые глаголы и местоимения",
      description: "Самые употребимые глаголы и местоимения для базовых фраз",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      level: 1,
      cards: [
        {
          front: "Я хочу",
          back: "I want",
          rule_description: "want + to: «I want to go» — я хочу пойти.",
        },
        {
          front: "Ты знаешь?",
          back: "Do you know?",
          rule_description: "Вопрос через вспомогательный do + know (знать).",
        },
        {
          front: "Мы идём",
          back: "We are going",
          rule_description: "Настоящее длительное: to be (are) + глагол с -ing.",
        },
        {
          front: "Я вижу",
          back: "I see",
          rule_description: "See (видеть) — неправильный глагол: see — saw — seen.",
        },
        {
          front: "Я не знаю",
          back: "I don't know",
          rule_description: "Отрицание через don't + инфинитив без to.",
        },
        {
          front: "Вы понимаете?",
          back: "Do you understand?",
          rule_description: "Вежливое «вы» = you; вопрос через do.",
        },
      ],
    },
    {
      title: "Essential Phrases & Greetings",
      description: "Базовые фразы вежливости, приветствия и повседневный этикет",
      native_language: "ru",
      target_language: "en",
      language_pair: "ru-en",
      level: 1,
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
      level: 1,
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
      level: 2,
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
      title: "O'tgan zamon fe'llari",
      description: "Chuqur o'rganish: -di o'tgan zami va inkor shakllari",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      level: 3,
      cards: [
        {
          front: "Men qildim",
          back: "Я сделал",
          rule_description: "O'tgan zamon -di: qil + di + m (1-shaxs yolg'iz).",
        },
        {
          front: "Sen bording",
          back: "Ты пошёл",
          rule_description: "Bormoq: bor + di + ng (2-shaxs yolg'iz).",
        },
        {
          front: "U o'qidi",
          back: "Она прочитала",
          rule_description: "O'qimoq: o'qi + di (3-shaxsda shaxs qo'shimchasi yo'q).",
        },
        {
          front: "Biz edik",
          back: "Мы были",
          rule_description: "Bo'lmak fe'lining o'tgan zamon shakli: edi + k (1-shaxs ko'plik).",
        },
        {
          front: "Tushunmadim",
          back: "Я не понял",
          rule_description: "Inkor -ma- -di dan oldin turadi: tushun + ma + di + m.",
        },
        {
          front: "Nima bo'ldi?",
          back: "Что случилось?",
          rule_description: "O'rnatilgan savol: nima (что) + bo'ldi (стало/случилось).",
        },
      ],
    },
    {
      title: "His-tuyg'ular va iboralar",
      description: "Chuqur o'rganish: kayfiyat, xarakter va o'zbek iboralari",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      level: 3,
      cards: [
        {
          front: "Men xursandman",
          back: "Я рад",
          rule_description: "Xursand (рад) + bog'lovchi -man («я есть»).",
        },
        {
          front: "Charchadim",
          back: "Я устал",
          rule_description: "Charchamoq (уставать) o'tgan zamonda: charcha + di + m.",
        },
        {
          front: "Xavotir olmang!",
          back: "Не переживайте!",
          rule_description: "Xavotir olmoq — «переживать» (so'zma-so'z «trevogu brat'»); olmang — hurmatli inkor.",
        },
        {
          front: "So'zida turmoq",
          back: "Держать слово",
          rule_description: "Ibora: so'z (слово) + da (на) + turmoq (стоять) — va'dani bajarish.",
        },
        {
          front: "Bosh qotirmoq",
          back: "Ломать голову",
          rule_description: "Ibora: so'zma-so'z «bosh (голова) qotirmoq (кипятить)» — ko'p o'ylash.",
        },
        {
          front: "Xo'p, xohlaganingizdek",
          back: "Как скажешь",
          rule_description: "Xo'p (ладно) + xohlaganingizdek (как хотите).",
        },
      ],
    },
    {
      title: "Oziq-ovqat va ichimliklar",
      description: "Oziq-ovqat mahsulotlari, buyurtma berish va oshxona leksikasi",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      level: 2,
      cards: [
        {
          front: "Non",
          back: "Хлеб",
          rule_description: "Non — o'zbek madaniyatida hurmatli ovqat: uni pichoq bilan kesmaydilar.",
        },
        {
          front: "Go'sht",
          back: "Мясо",
          rule_description: "«Mol go'shti» — говядина, «qo'y go'shti» — баранина.",
        },
        {
          front: "Sut va suv",
          back: "Молоко и вода",
          rule_description: "Sut (молоко), suv (вода).",
        },
        {
          front: "Choy ichamizmi?",
          back: "Выпьем чай?",
          rule_description: "Choy (чай) + ichmoq (пить) + -mizmi (вежливый вопрос, 1-е лицо мн.).",
        },
        {
          front: "Ochdim",
          back: "Я проголодался",
          rule_description: "So'zma-so'z «otкрыlsya»: kundalik nutqda «ochdim» — «хочу есть».",
        },
        {
          front: "Juda mazali!",
          back: "Очень вкусно!",
          rule_description: "Juda (очень) + mazali (вкусный).",
        },
      ],
    },
    {
      title: "Vaqt va savol so'zlari",
      description: "Kunlar, vaqt va savol berish uchun kalit so'zlar",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      level: 2,
      cards: [
        {
          front: "Bugun",
          back: "Сегодня",
          rule_description: "Bugun (сегодня); «bugun kechqurun» — сегодня вечером.",
        },
        {
          front: "Ertaga",
          back: "Завтра",
          rule_description: "Ertaga (завтра); «ertalab» — утром.",
        },
        {
          front: "Kecha",
          back: "Вчера",
          rule_description: "Kecha (вчера); «kecha kechqurun» — вчера вечером.",
        },
        {
          front: "Kim?",
          back: "Кто?",
          rule_description: "Kim — shaxs haqida savol (кто).",
        },
        {
          front: "Qachon?",
          back: "Когда?",
          rule_description: "Qachon — vaqt haqida savol (когда).",
        },
        {
          front: "Nima uchun?",
          back: "Почему?",
          rule_description: "So'zma-so'z «nima (что) + uchun (для)» — почему.",
        },
      ],
    },
    {
      title: "Ranglar va belgilar",
      description: "Asosiy ranglar va qarama-qarshi belgilar",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      level: 1,
      cards: [
        {
          front: "Qizil rang",
          back: "Красный цвет",
          rule_description: "Qizil (красный) + rang (цвет).",
        },
        {
          front: "Ko'k",
          back: "Синий / голубой",
          rule_description: "Ko'k — ham sariq ko'k (тёмно-синий), ham och ko'k (голубой) ma'noda ishlatiladi.",
        },
        {
          front: "Sariq va yashil",
          back: "Жёлтый и зелёный",
          rule_description: "Sariq (жёлтый) + va (и) + yashil (зелёный).",
        },
        {
          front: "Oq va qora",
          back: "Белый и чёрный",
          rule_description: "Asosiy qarama-qarshi ranglar juftligi.",
        },
        {
          front: "Katta va kichik",
          back: "Большой и маленький",
          rule_description: "Katta (большой), kichik (маленький); «kichkina» — norasmiy variant.",
        },
        {
          front: "Yaxshi va yomon",
          back: "Хороший и плохой",
          rule_description: "Sifat baholash uchun universal so'zlar.",
        },
      ],
    },
    {
      title: "Fe'llar va olmoshlar",
      description: "Eng ko'p ishlatiladigan fe'llar va olmoshlar",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      level: 1,
      cards: [
        {
          front: "Men xohlayman",
          back: "Я хочу",
          rule_description: "Men (я) + xohlamoq (хотеть): xohla-y-man — hozirgi zamon.",
        },
        {
          front: "Sen bilasanmi?",
          back: "Ты знаешь?",
          rule_description: "Bilmoq (знать) + -san (2-shaxs) + -mi (savol zarrasi).",
        },
        {
          front: "Biz boryapmiz",
          back: "Мы идём / едем",
          rule_description: "Bormoq (идти) + -yapmiz (hozirgi davomiy zamon).",
        },
        {
          front: "Men ko'ryapman",
          back: "Я вижу",
          rule_description: "Ko'rmoq (видеть) + -yapman (hozirgi zamon).",
        },
        {
          front: "Bilmayman",
          back: "Я не знаю",
          rule_description: "Inkor -ma- qo'shimchasi orqali: bil-ma-y-man.",
        },
        {
          front: "Tushunyapsizmi?",
          back: "Вы понимаете?",
          rule_description: "Tushunmoq (понимать) + -siz (hurmatli «siz») + -mi (savol).",
        },
      ],
    },
    {
      title: "Asosiy iboralar va salomlashish",
      description: "Kundalik muloqot va xushmuomalalik iboralari",
      native_language: "uz",
      target_language: "ru",
      language_pair: "uz-ru",
      level: 1,
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
      level: 1,
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
      level: 2,
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
      title: "O'tgan zamon fe'llari",
      description: "Chuqur o'rganish: Past Simple — to'g'ri va noto'g'ri fe'llar",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      level: 3,
      cards: [
        {
          front: "Men qildim",
          back: "I did",
          rule_description: "To'g'ri fe'llarda o'tgan zamon: fe'l + -ed (worked, played).",
        },
        {
          front: "Sen bording",
          back: "You went",
          rule_description: "Noto'g'ri fe'l: go — went — gone.",
        },
        {
          front: "U o'qidi",
          back: "She read",
          rule_description: "read o'tgan zamonda «red» deb talaffuz qilinadi.",
        },
        {
          front: "Biz edik",
          back: "We were",
          rule_description: "to be o'tgan zamonda: I/he/she/it — was, you/we/they — were.",
        },
        {
          front: "Tushunmadim",
          back: "I didn't understand",
          rule_description: "Inkor: didn't + infinitiv (to siz).",
        },
        {
          front: "Nima bo'ldi?",
          back: "What happened?",
          rule_description: "happen (bo'lmoq/sodir bo'loq) — to'g'ri fe'l: happened.",
        },
      ],
    },
    {
      title: "His-tuyg'ular va iboralar",
      description: "Chuqur o'rganish: kayfiyat, xarakter va ingliz iboralari",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      level: 3,
      cards: [
        {
          front: "Men xursandman",
          back: "I am glad",
          rule_description: "glad (xursand); «I'm glad to hear it» — buni eshitganimdan xursandman.",
        },
        {
          front: "Charchadim",
          back: "I am tired",
          rule_description: "tired (charchagan) + to be: «I'm tired».",
        },
        {
          front: "Xavotir olmang!",
          back: "Don't worry!",
          rule_description: "Don't worry — so'zma-so'z «bezovta bo'lmang».",
        },
        {
          front: "So'zida turmoq",
          back: "To keep one's word",
          rule_description: "Ibora: keep (saqlamoq) + one's word (so'z) — va'dani bajarish.",
        },
        {
          front: "Bosh qotirmoq",
          back: "To rack one's brains",
          rule_description: "Ibora: so'zma-so'z «miyani tebratmoq» — ko'p o'ylash.",
        },
        {
          front: "Xo'p, xohlaganingizdek",
          back: "Whatever you say",
          rule_description: "Norasmiy variant: «xohlaganingizdek».",
        },
      ],
    },
    {
      title: "Oziq-ovqat va ichimliklar",
      description: "Oziq-ovqat mahsulotlari, buyurtma berish va oshxona leksikasi",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      level: 2,
      cards: [
        {
          front: "Non",
          back: "Bread",
          rule_description: "Sanalmaydigan so'z: «a loaf of bread» — bir dona non.",
        },
        {
          front: "Go'sht",
          back: "Meat",
          rule_description: "beef (mol go'shti), chicken (tovuq go'shti), pork (cho'chqa go'shti).",
        },
        {
          front: "Sut va suv",
          back: "Milk and water",
          rule_description: "Sanalmaydigan so'zlar — artiklsiz ishlatiladi.",
        },
        {
          front: "Choy ichasizmi?",
          back: "Would you like some tea?",
          rule_description: "Xushmuomala taklif: Would you like + some + ichimlik.",
        },
        {
          front: "Ochdim",
          back: "I am hungry",
          rule_description: "hungry (och) + to be: «I'm hungry».",
        },
        {
          front: "Juda mazali!",
          back: "It's very delicious!",
          rule_description: "delicious (mazali) — kuchli ma'noli so'z.",
        },
      ],
    },
    {
      title: "Vaqt va savol so'zlari",
      description: "Kunlar, vaqt va savol berish uchun kalit so'zlar",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      level: 2,
      cards: [
        {
          front: "Bugun",
          back: "Today",
          rule_description: "bugun (today), ertaga (tomorrow), kecha (yesterday).",
        },
        {
          front: "Ertaga",
          back: "Tomorrow",
          rule_description: "tomorrow (ertaga) — predsiz: «see you tomorrow».",
        },
        {
          front: "Kecha",
          back: "Yesterday",
          rule_description: "yesterday (kecha) + o'tgan zamon: «I went yesterday».",
        },
        {
          front: "Kim?",
          back: "Who?",
          rule_description: "Who (kim), whom (kimni) — ega va to'ldiruvchi.",
        },
        {
          front: "Qachon?",
          back: "When?",
          rule_description: "When — vaqt haqida savol.",
        },
        {
          front: "Nima uchun?",
          back: "Why?",
          rule_description: "Javob ko'pincha because (chunki) orqali beriladi.",
        },
      ],
    },
    {
      title: "Ranglar va belgilar",
      description: "Asosiy ranglar va qarama-qarshi belgilar",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      level: 1,
      cards: [
        {
          front: "Qizil rang",
          back: "Red",
          rule_description: "Qizil (red) + rang (color).",
        },
        {
          front: "Ko'k",
          back: "Blue",
          rule_description: "Ko'k — «light blue» (och ko'k) ham, «dark blue» (to'q ko'k) ham bo'lishi mumkin.",
        },
        {
          front: "Sariq va yashil",
          back: "Yellow and green",
          rule_description: "and — «va» ga teng.",
        },
        {
          front: "Oq va qora",
          back: "White and black",
          rule_description: "Asosiy qarama-qarshi ranglar juftligi.",
        },
        {
          front: "Katta va kichik",
          back: "Big and small",
          rule_description: "katta (big/large), kichik (small).",
        },
        {
          front: "Yaxshi va yomon",
          back: "Good and bad",
          rule_description: "yaxshi (good), yomon (bad).",
        },
      ],
    },
    {
      title: "Fe'llar va olmoshlar",
      description: "Eng ko'p ishlatiladigan fe'llar va olmoshlar",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      level: 1,
      cards: [
        {
          front: "Men xohlayman",
          back: "I want",
          rule_description: "want + to: «I want to go» — bormoqchiman.",
        },
        {
          front: "Sen bilasanmi?",
          back: "Do you know?",
          rule_description: "Savol yordamchi do orqali: do + know (bilmoq).",
        },
        {
          front: "Biz boryapmiz",
          back: "We are going",
          rule_description: "Hozirgi davomiy zamon: to be (are) + fe'l + -ing.",
        },
        {
          front: "Men ko'ryapman",
          back: "I see",
          rule_description: "see (ko'rmoq) — noto'g'ri fe'l: see — saw — seen.",
        },
        {
          front: "Bilmayman",
          back: "I don't know",
          rule_description: "Inkor: don't + infinitiv (to siz).",
        },
        {
          front: "Tushunyapsizmi?",
          back: "Do you understand?",
          rule_description: "understand (tushunmoq); savol do orqali.",
        },
      ],
    },
    {
      title: "Everyday Greetings & Basics",
      description: "Essential phrases for everyday communication",
      native_language: "uz",
      target_language: "en",
      language_pair: "uz-en",
      level: 1,
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
      level: 1,
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
      level: 2,
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

  // 5. RU -> IT
  "ru-it": [
    {
      title: "Эмоции и устойчивые выражения",
      description: "Углублённое изучение: чувства, характер и итальянские идиомы",
      native_language: "ru",
      target_language: "it",
      language_pair: "ru-it",
      level: 3,
      cards: [
        {
          front: "Я рад",
          back: "Sono contento",
          rule_description: "contento (доволен/рад); «Sono contento di conoscerti» — рад познакомиться.",
        },
        {
          front: "Я устал",
          back: "Sono stanco",
          rule_description: "stanco (уставший): «Sono stanco» — я устал.",
        },
        {
          front: "Не переживайте!",
          back: "Non si preoccupi!",
          rule_description: "Preoccuparsi — переживать; non si preoccupi — вежливый запрет.",
        },
        {
          front: "Держать слово",
          back: "Mantenere la parola",
          rule_description: "Идиома: mantenere (держать/соблюдать) + parola (слово).",
        },
        {
          front: "Ломать голову",
          back: "Scervellarsi",
          rule_description: "Идиома: букв. «ломать себе голову» — много думать.",
        },
        {
          front: "Как скажешь",
          back: "Come vuoi",
          rule_description: "«Come dici tu» — разговорный вариант «как скажешь».",
        },
      ],
    },
    {
      title: "Время и вопросительные слова",
      description: "Дни, время и ключевые слова для вопросов",
      native_language: "ru",
      target_language: "it",
      language_pair: "ru-it",
      level: 2,
      cards: [
        {
          front: "Сегодня",
          back: "Oggi",
          rule_description: "oggi (сегодня), domani (завтра), ieri (вчера).",
        },
        {
          front: "Завтра",
          back: "Domani",
          rule_description: "«A domani!» — до завтра!",
        },
        {
          front: "Вчера",
          back: "Ieri",
          rule_description: "ieri + прошедшее время: «Ieri sono stato...» — вчера я был...",
        },
        {
          front: "Кто?",
          back: "Chi?",
          rule_description: "Chi — кто; «Chi è?» — кто это?",
        },
        {
          front: "Когда?",
          back: "Quando?",
          rule_description: "Quando — когда.",
        },
        {
          front: "Почему?",
          back: "Perché?",
          rule_description: "Perché — и «почему», и «потому что» (по контексту).",
        },
      ],
    },
    {
      title: "Грамматика: прошедшее время",
      description: "Углублённое изучение: passato prossimo и отрицание",
      native_language: "ru",
      target_language: "it",
      language_pair: "ru-it",
      level: 3,
      cards: [
        {
          front: "Я сделал",
          back: "Ho fatto",
          rule_description: "Passato prossimo: avere + причастие (fare → fatto).",
        },
        {
          front: "Ты пошёл",
          back: "Sei andato",
          rule_description: "Глаголы движения спрягаются с essere: andare → andato.",
        },
        {
          front: "Она прочитала",
          back: "Ha letto",
          rule_description: "Leggere (читать) → причастие letto (с ha).",
        },
        {
          front: "Мы были",
          back: "Siamo stati",
          rule_description: "Связка essere в прошлом: siamo stati.",
        },
        {
          front: "Я не понял",
          back: "Non ho capito",
          rule_description: "Отрицание non ставится перед вспомогательным глаголом.",
        },
        {
          front: "Что случилось?",
          back: "Cos'è successo?",
          rule_description: "Succedere (случаться): «что случилось» — букв. «что случилось».",
        },
      ],
    },
    {
      title: "Ориентация в городе и такси",
      description: "Фразы для передвижения по городу, метро и вызова такси",
      native_language: "ru",
      target_language: "it",
      language_pair: "ru-it",
      level: 2,
      cards: [
        {
          front: "Где находится метро?",
          back: "Dov'è la metropolitana?",
          rule_description: "Dov'è (где) + la metropolitana (метро); «la stazione» — вокзал.",
        },
        {
          front: "Остановите здесь, пожалуйста",
          back: "Si fermi qui, per favore",
          rule_description: "Si fermi — вежливое «остановитесь» (повелительное наклонение Lei).",
        },
        {
          front: "Поверните направо",
          back: "Giri a destra",
          rule_description: "Giri (поверните) + a destra (направо).",
        },
        {
          front: "Поверните налево",
          back: "Giri a sinistra",
          rule_description: "a sinistra — налево.",
        },
        {
          front: "Езжайте прямо",
          back: "Vada dritto",
          rule_description: "Vada (езжайте) + dritto (прямо).",
        },
        {
          front: "Сколько стоит проезд?",
          back: "Quanto costa la corsa?",
          rule_description: "corsa — поездка (на такси).",
        },
      ],
    },
    {
      title: "Еда и продукты",
      description: "Продукты питания, заказ еды и базовая лексика кухни",
      native_language: "ru",
      target_language: "it",
      language_pair: "ru-it",
      level: 2,
      cards: [
        {
          front: "Хлеб",
          back: "Pane",
          rule_description: "«Un pane» — буханка хлеба; итальянцы не режут его ножом на столе.",
        },
        {
          front: "Мясо",
          back: "Carne",
          rule_description: "«carne rossa» — красное мясо; «pollo» — курица.",
        },
        {
          front: "Молоко и вода",
          back: "Latte e acqua",
          rule_description: "latte (молоко), acqua (вода).",
        },
        {
          front: "Чай / кофе",
          back: "Tè / caffè",
          rule_description: "«Un caffè, per favore» — кофе, пожалуйста (эспрессо).",
        },
        {
          front: "Я проголодался",
          back: "Ho fame",
          rule_description: "Буквально «имею голод»: ho (имею) + fame (голод).",
        },
        {
          front: "Очень вкусно!",
          back: "È delizioso!",
          rule_description: "delizioso — восхитительно.",
        },
      ],
    },
    {
      title: "Цвета и признаки",
      description: "Основные цвета и противоположные признаки для описания предметов",
      native_language: "ru",
      target_language: "it",
      language_pair: "ru-it",
      level: 1,
      cards: [
        {
          front: "Красный цвет",
          back: "Rosso",
          rule_description: "Rosso (красный); «vino rosso» — красное вино.",
        },
        {
          front: "Синий / голубой",
          back: "Blu",
          rule_description: "Blu — и синий, и голубой; «azzurro» — голубой.",
        },
        {
          front: "Жёлтый и зелёный",
          back: "Giallo e verde",
          rule_description: "e — союз «и».",
        },
        {
          front: "Белый и чёрный",
          back: "Bianco e nero",
          rule_description: "Базовая пара противоположных цветов.",
        },
        {
          front: "Большой и маленький",
          back: "Grande e piccolo",
          rule_description: "Grande (большой), piccolo (маленький).",
        },
        {
          front: "Хороший / плохой",
          back: "Buono / cattivo",
          rule_description: "Buono также значит «вкусный» (о еде).",
        },
      ],
    },
    {
      title: "Частые глаголы и местоимения",
      description: "Самые употребимые глаголы и местоимения для базовых фраз",
      native_language: "ru",
      target_language: "it",
      language_pair: "ru-it",
      level: 1,
      cards: [
        {
          front: "Я хочу",
          back: "Voglio",
          rule_description: "Volere (хотеть): voglio — 1-е лицо; «Voglio andare» — хочу пойти.",
        },
        {
          front: "Ты знаешь?",
          back: "Sai?",
          rule_description: "Sapere (знать): sai — 2-е лицо.",
        },
        {
          front: "Мы идём / пойдём",
          back: "Andiamo",
          rule_description: "Andare (идти): andiamo — «мы идём», часто «пойдём!».",
        },
        {
          front: "Я вижу",
          back: "Vedo",
          rule_description: "Vedere (видеть): vedo — 1-е лицо.",
        },
        {
          front: "Я не знаю",
          back: "Non lo so",
          rule_description: "Буквально «не знаю этого»: non + lo + so.",
        },
        {
          front: "Вы понимаете?",
          back: "Capisce?",
          rule_description: "Capire (понимать): capisce — вежливое «вы понимаете».",
        },
      ],
    },
    {
      title: "Базовые фразы и приветствия",
      description: "Самые нужные фразы для вежливого общения и первого знакомства",
      native_language: "ru",
      target_language: "it",
      language_pair: "ru-it",
      level: 1,
      cards: [
        {
          front: "Привет / Здравствуйте",
          back: "Ciao / Salve",
          rule_description: "Ciao — неформально; Salve — вежливое приветствие.",
        },
        {
          front: "Спасибо большое",
          back: "Grazie mille",
          rule_description: "Grazie (спасибо) + mille (тысяча) — «спасибо тысяччу раз».",
        },
        {
          front: "До свидания, до встречи",
          back: "Arrivederci",
          rule_description: "Универсальное прощание, букв. «до встречи».",
        },
        {
          front: "Как ваши дела?",
          back: "Come sta?",
          rule_description: "Come sta? — вежливо (вы); Come stai? — друзьям (ты).",
        },
        {
          front: "Пожалуйста / Не за что",
          back: "Prego / Di niente",
          rule_description: "Prego — «прошу/пожалуйста»; Di niente — «не за что».",
        },
      ],
    },
    {
      title: "Числа и покупки",
      description: "Счет, вопросы о ценах и общение в магазине",
      native_language: "ru",
      target_language: "it",
      language_pair: "ru-it",
      level: 1,
      cards: [
        {
          front: "Один, два, три, четыре, пять",
          back: "Uno, due, tre, quattro, cinque",
          rule_description: "Базовые числительные от 1 до 5.",
        },
        {
          front: "Сколько это стоит?",
          back: "Quanto costa?",
          rule_description: "Quanto (сколько) + costa (стоит, 3-е лицо).",
        },
        {
          front: "Сделайте скидку",
          back: "Mi fa uno sconto?",
          rule_description: "Mi fa (сделайте мне) + sconto (скидка).",
        },
        {
          front: "Это слишком дорого",
          back: "È troppo caro",
          rule_description: "troppo (слишком) + caro (дорогой).",
        },
        {
          front: "Дайте пакет, пожалуйста",
          back: "Mi dà una borsa, per favore?",
          rule_description: "borsa — пакет/сумка; Mi dà — вежливое «дайте мне».",
        },
      ],
    },
  ],

  // 6. UZ -> IT
  "uz-it": [
    {
      title: "His-tuyg'ular va iboralar",
      description: "Chuqur o'rganish: kayfiyat, xarakter va italyan iboralari",
      native_language: "uz",
      target_language: "it",
      language_pair: "uz-it",
      level: 3,
      cards: [
        {
          front: "Men xursandman",
          back: "Sono contento",
          rule_description: "contento (xursand/mamnun).",
        },
        {
          front: "Charchadim",
          back: "Sono stanco",
          rule_description: "stanco (charchagan).",
        },
        {
          front: "Xavotir olmang!",
          back: "Non si preoccupi!",
          rule_description: "Preoccuparsi — xavotir olmoq; non si preoccupi — hurmatli.",
        },
        {
          front: "So'zida turmoq",
          back: "Mantenere la parola",
          rule_description: "Ibora: mantenere (saqlamoq) + parola (so'z).",
        },
        {
          front: "Bosh qotirmoq",
          back: "Scervellarsi",
          rule_description: "Ibora: so'zma-so'z «boshni sindirmoq» — ko'p o'ylash.",
        },
        {
          front: "Xo'p, xohlaganingizdek",
          back: "Come vuoi",
          rule_description: "«Come dici tu» — xohlaganingizdek.",
        },
      ],
    },
    {
      title: "Vaqt va savol so'zlari",
      description: "Kunlar, vaqt va savol berish uchun kalit so'zlar",
      native_language: "uz",
      target_language: "it",
      language_pair: "uz-it",
      level: 2,
      cards: [
        {
          front: "Bugun",
          back: "Oggi",
          rule_description: "bugun (oggi), ertaga (domani), kecha (ieri).",
        },
        {
          front: "Ertaga",
          back: "Domani",
          rule_description: "«A domani!» — ertagacha!",
        },
        {
          front: "Kecha",
          back: "Ieri",
          rule_description: "ieri + o'tgan zamon: «Ieri sono stato...».",
        },
        {
          front: "Kim?",
          back: "Chi?",
          rule_description: "Chi — kim; «Chi è?» — bu kim?",
        },
        {
          front: "Qachon?",
          back: "Quando?",
          rule_description: "Quando — qachon.",
        },
        {
          front: "Nima uchun?",
          back: "Perché?",
          rule_description: "Perché — «nima uchun» ham, «chunki» ham bo'ladi.",
        },
      ],
    },
    {
      title: "O'tgan zamon fe'llari",
      description: "Chuqur o'rganish: passato prossimo va inkor shakllari",
      native_language: "uz",
      target_language: "it",
      language_pair: "uz-it",
      level: 3,
      cards: [
        {
          front: "Men qildim",
          back: "Ho fatto",
          rule_description: "Passato prossimo: avere + ish qatnashchi (fare → fatto).",
        },
        {
          front: "Sen bording",
          back: "Sei andato",
          rule_description: "Harakat fe'llari essere bilan: andare → andato.",
        },
        {
          front: "U o'qidi",
          back: "Ha letto",
          rule_description: "Leggere (o'qimoq) → letto (ha bilan).",
        },
        {
          front: "Biz edik",
          back: "Siamo stati",
          rule_description: "Bo'lmak o'tgan zamonda: siamo stati.",
        },
        {
          front: "Tushunmadim",
          back: "Non ho capito",
          rule_description: "Inkor non yordamchi fe'l oldida turadi.",
        },
        {
          front: "Nima bo'ldi?",
          back: "Cos'è successo?",
          rule_description: "Succedere (bo'lmoq): successo.",
        },
      ],
    },
    {
      title: "Shahar va transport",
      description: "Shaharda yo'l so'rash, metro va taksida harakatlanish",
      native_language: "uz",
      target_language: "it",
      language_pair: "uz-it",
      level: 2,
      cards: [
        {
          front: "Metro qayerda joylashgan?",
          back: "Dov'è la metropolitana?",
          rule_description: "Dov'è (qayerda) + la metropolitana (metro); «la stazione» — vokzal.",
        },
        {
          front: "Iltimos, shu yerda to'xtating",
          back: "Si fermi qui, per favore",
          rule_description: "Si fermi — hurmatli «to'xtating».",
        },
        {
          front: "O'ngga buriling",
          back: "Giri a destra",
          rule_description: "Giri (buriling) + a destra (o'ngga).",
        },
        {
          front: "Chapga buriling",
          back: "Giri a sinistra",
          rule_description: "a sinistra — chapga.",
        },
        {
          front: "To'g'riga yuring",
          back: "Vada dritto",
          rule_description: "dritto — to'g'ri.",
        },
        {
          front: "Yo'l haqi qancha?",
          back: "Quanto costa la corsa?",
          rule_description: "corsa — taksi yo'li.",
        },
      ],
    },
    {
      title: "Oziq-ovqat va ichimliklar",
      description: "Oziq-ovqat mahsulotlari, buyurtma berish va oshxona leksikasi",
      native_language: "uz",
      target_language: "it",
      language_pair: "uz-it",
      level: 2,
      cards: [
        {
          front: "Non",
          back: "Pane",
          rule_description: "«Un pane» — bir dona non.",
        },
        {
          front: "Go'sht",
          back: "Carne",
          rule_description: "«pollo» — tovuq go'shti.",
        },
        {
          front: "Sut va suv",
          back: "Latte e acqua",
          rule_description: "latte (sut), acqua (suv).",
        },
        {
          front: "Choy / qahva",
          back: "Tè / caffè",
          rule_description: "«Un caffè, per favore» — qahva, iltimos.",
        },
        {
          front: "Ochdim",
          back: "Ho fame",
          rule_description: "So'zma-so'z «ochlikman»: ho (bor) + fame (ochlik).",
        },
        {
          front: "Juda mazali!",
          back: "È delizioso!",
          rule_description: "delizioso — ajoyib mazali.",
        },
      ],
    },
    {
      title: "Ranglar va belgilar",
      description: "Asosiy ranglar va qarama-qarshi belgilar",
      native_language: "uz",
      target_language: "it",
      language_pair: "uz-it",
      level: 1,
      cards: [
        {
          front: "Qizil rang",
          back: "Rosso",
          rule_description: "Rosso (qizil); «vino rosso» — qizil sharob.",
        },
        {
          front: "Ko'k",
          back: "Blu",
          rule_description: "Blu — «azzurro» — och ko'k.",
        },
        {
          front: "Sariq va yashil",
          back: "Giallo e verde",
          rule_description: "e — «va» ga teng.",
        },
        {
          front: "Oq va qora",
          back: "Bianco e nero",
          rule_description: "Asosiy qarama-qarshi ranglar juftligi.",
        },
        {
          front: "Katta va kichik",
          back: "Grande e piccolo",
          rule_description: "katta (grande), kichik (piccolo).",
        },
        {
          front: "Yaxshi va yomon",
          back: "Buono / cattivo",
          rule_description: "Buono — ovqat haqida «mazali» ma'nosida ham ishlatiladi.",
        },
      ],
    },
    {
      title: "Fe'llar va olmoshlar",
      description: "Eng ko'p ishlatiladigan fe'llar va olmoshlar",
      native_language: "uz",
      target_language: "it",
      language_pair: "uz-it",
      level: 1,
      cards: [
        {
          front: "Men xohlayman",
          back: "Voglio",
          rule_description: "Volere (xohlamoq): voglio — 1-shaxs.",
        },
        {
          front: "Sen bilasanmi?",
          back: "Sai?",
          rule_description: "Sapere (bilmoq): sai — 2-shaxs.",
        },
        {
          front: "Biz boryapmiz",
          back: "Andiamo",
          rule_description: "Andare (bormoq): andiamo — «biz boryapmiz», ko'pincha «yurmiz!».",
        },
        {
          front: "Men ko'ryapman",
          back: "Vedo",
          rule_description: "Vedere (ko'rmoq): vedo — 1-shaxs.",
        },
        {
          front: "Bilmayman",
          back: "Non lo so",
          rule_description: "So'zma-so'z «buni bilmayman»: non + lo + so.",
        },
        {
          front: "Tushunyapsizmi?",
          back: "Capisce?",
          rule_description: "Capire (tushunmoq): capisce — hurmatli shakl.",
        },
      ],
    },
    {
      title: "Asosiy iboralar va salomlashish",
      description: "Kundalik muloqot va xushmuomalalik iboralari",
      native_language: "uz",
      target_language: "it",
      language_pair: "uz-it",
      level: 1,
      cards: [
        {
          front: "Salom / Assalomu alaykum",
          back: "Ciao / Salve",
          rule_description: "Ciao — norasmiy; Salve — hurmatli salomlashish.",
        },
        {
          front: "Katta rahmat",
          back: "Grazie mille",
          rule_description: "Grazie (rahmat) + mille (ming) — «ming marta rahmat».",
        },
        {
          front: "Xayr, ko'rishguncha",
          back: "Arrivederci",
          rule_description: "Universal xayrlashish — «ko'rishguncha» ma'noda.",
        },
        {
          front: "Ishlaringiz qalay?",
          back: "Come sta?",
          rule_description: "Come sta? — hurmatli; Come stai? — do'stlarga.",
        },
        {
          front: "Arzimaydi",
          back: "Prego / Di niente",
          rule_description: "Prego — «iltimos»; Di niente — «arzimaydi».",
        },
      ],
    },
    {
      title: "Raqamlar va xaridlar",
      description: "Sanoq, narx so'rash va do'konda muloqot",
      native_language: "uz",
      target_language: "it",
      language_pair: "uz-it",
      level: 1,
      cards: [
        {
          front: "Bir, ikki, uch, to'rt, besh",
          back: "Uno, due, tre, quattro, cinque",
          rule_description: "1 dan 5 gacha asosiy sonlar.",
        },
        {
          front: "Bu qancha turadi?",
          back: "Quanto costa?",
          rule_description: "Quanto (qancha) + costa (turadi).",
        },
        {
          front: "Chegirma qilib berasizmi?",
          back: "Mi fa uno sconto?",
          rule_description: "sconto — chegirma; Mi fa — «qilib berasizmi».",
        },
        {
          front: "Bu juda qimmat",
          back: "È troppo caro",
          rule_description: "troppo (juda) + caro (qimmat).",
        },
        {
          front: "Menga borsa bering, iltimos",
          back: "Mi dà una borsa, per favore?",
          rule_description: "borsa — sumka/paket.",
        },
      ],
    },
  ],
};

// Fallback legacy export
export const SEED_DECKS = STARTER_DECKS["ru-uz"];
