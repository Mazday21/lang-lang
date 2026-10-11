/**
 * UI localization: Russian → Uzbek (interface follows the user's native language).
 * translate() looks up the Russian source string in UZ_MAP; a missing entry
 * falls back to the Russian text (never breaks the UI).
 * Named placeholders like {count} are substituted in both languages.
 */

export type UiLang = "ru" | "uz";

export function translate(
  lang: UiLang,
  text: string,
  params?: Record<string, string | number>
): string {
  let out = lang === "uz" ? UZ_MAP[text] ?? text : text;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      out = out.split(`{${key}}`).join(String(value));
    }
  }
  return out;
}

export const UZ_MAP: Record<string, string> = {
  // ── Hub ──────────────────────────────────────────────
  "Привет, ": "Salom, ",
  "Личный тренажер": "Shaxsiy mashq treneri",
  "Сменить язык обучения": "O'qish tilini almashtirish",
  Настройки: "Sozlamalar",
  "Повторение на сегодня": "Bugungi takrorlash",
  карточка: "ta kartochka",
  карточки: "ta kartochka",
  карточек: "ta kartochka",
  "Всё повторено!": "Hammasi takrorlandi!",
  "План выполнен!": "Kunlik reja bajarildi!",
  "Ещё {count} можно повторить позже": "Yana {count} ta kartochkani keyinroq takrorlash mumkin",
  "Ещё {count} {word} — повторите позже или завтра":
    "Yana {count} {word} — ertaga yoki keyinroq takrorlang",
  "Уровень владения:": "Til darajasi:",
  "(+{n} за обучение)": "(+{n} o'rganish uchun)",
  "Пройти заново": "Qayta topshirish",
  "Пройти тест": "Testni topshirish",
  "Попробовать ИИ-суперсилы": "AI-superkuchlarini sinab ko'ring",
  "Сгенерировать колоду с помощью AI": "AI yordamida to'plam yaratish",
  "Колоды для изучения ({pair})": "O'rganish uchun to'plamlar ({pair})",
  "Обновить список": "Ro'yxatni yangilash",
  "У вас пока нет колод для этой языковой пары":
    "Bu til juftligi uchun hali to'plamlaringiz yo'q",
  "Давайте создадим первую с помощью ИИ! Назовите любую тему — от приветствий до покупок.":
    "Keling, birinchisini AI yordamida yaratamiz! Istalgan mavzuni kiriting — salomlashishdan tortib xaridlargacha.",
  "Создать колоду ({pair})": "To'plam yaratish ({pair})",
  "Уровень {level} · {name}": "Daraja {level} · {name}",
  Рекомендуем: "Tavsiya etamiz",
  колод: "to'plam",
  "к повторению": "takrorlashga",
  "Всего:": "Jami:",
  "Все {n} слов повторены": "Barcha {n} so'z takrorlandi",
  "Удалить колоду": "To'plamni o'chirish",

  // ── Level / proficiency names ────────────────────────
  Новичок: "Yangi boshlovchi",
  Начальный: "Boshlang'ich",
  Базовый: "Asosiy",
  Средний: "O'rta",
  Уверенный: "Ishonchli",
  Продвинутый: "Yuqori",
  Эксперт: "Ekspert",

  // ── Training ─────────────────────────────────────────
  КОЛОДА: "TO'PLAM",
  Задание: "Vazifa",
  Результат: "Natija",
  "Правильный ответ": "To'g'ri javob",
  "Ваш ответ:": "Sizning javobingiz:",
  "Верно!": "To'g'ri!",
  "Ваш ответ верный!": "Javobingiz to'g'ri!",
  "Есть ошибка": "Xatolik bor",
  "Проверить ответ": "Javobni tekshirish",
  "Ваш перевод или ответ:": "Tarjamangiz yoki javobingiz:",
  "можно писать латиницей или кириллицей":
    "lotin yoki kirill alifbosida yozish mumkin",
  "Введите ответ на изучаемом языке...":
    "Javobni o'rganilayotgan tilda kiriting...",
  "Голосовой ответ": "Ovozli javob",
  "Остановить запись": "Yozishni to'xtatish",
  "Голосовые попытки исчерпаны": "Ovozli urinishlar tugadi",
  "Идёт распознавание...": "Nutq aniqlanmoqda...",
  "Запись... Говорите!": "Yozilmoqda... Gapiring!",
  "Попробовать сказать еще раз (1/1)": "Yana bir marta gapirib ko'ring (1/1)",
  "Ввести ответ текстом": "Javobni matn bilan kiritish",
  "Проверить исправленный текст": "Tuzatilgan matnni tekshirish",
  "Да, это мой ответ": "Ha, bu mening javobim",
  Далее: "Keyingi",
  "Оцените запоминание": "Eslab qolishni baholang",
  "Тренировка завершена!": "Mashq tugadi!",
  "Повторено карточек: {n}. Все интервалы повторения пересчитаны по алгоритму SM-2.":
    "Takrorlangan kartochkalar: {n}. Barcha takrorlash intervallari SM-2 algoritmi bo'yicha qayta hisoblandi.",
  "Уровень владения: {n}/10": "Til darajasi: {n}/10",
  "Вернуться в хаб": "Bosh sahifaga qaytish",
  "Пройти ещё раз": "Yana mashq qilish",
  "Вы изучили все карточки этой сессии!": "Bu sessiyaning barcha kartochkalarini o'rgandingiz!",
  "Ой! Что-то пошло не так": "Voy! Nimadir xato ketdi",
  "Попробовать снова": "Qayta urinib ko'rish",

  // ── Settings ─────────────────────────────────────────
  "Профиль и Тариф": "Profil va Tarif",
  "В хаб": "Bosh sahifaga",
  "Лимиты ИИ": "AI limitlari",
  "Ежедневные лимиты: 60 голосовых проверок и 5 генераций колод":
    "Kunlik limitlar: 60 ta ovozli tekshiruv va 5 ta to'plam generatsiyasi",
  "Пробный лимит: 5 AI-проверок на аккаунт • генерация колод в Pro":
    "Sinov limiti: hisobga 5 ta AI-tekshiruv • to'plam generatsiyasi Pro'da",
  "AI-проверки голоса": "Ovozli AI-tekshiruvlar",
  "{a} из {b} /день": "{a} ta / {b} kuniga",
  "Пробных проверок на аккаунт осталось: {n}":
    "Hisobda qolgan sinov tekshiruvlari: {n}",
  "Генерация колод с помощью ИИ": "AI yordamida to'plam generatsiyasi",
  "Доступно в Pro": "Pro'da mavjud",
  "Тариф Pro": "Pro tarifi",
  "Полный фокус на изучении без пауз и ограничений":
    "To'xtovsiz va cheklovsiz o'rganishga to'liq e'tibor",
  "Создание персональных колод по любой теме с помощью ИИ":
    "AI yordamida istalgan mavzuda shaxsiy to'plamlar yaratish",
  "60 голосовых проверок в день с умным распознаванием речи":
    "Kuniga 60 ta ovozli tekshiruv, aqlli nutq aniqlash bilan",
  "Умные закрепляющие колоды под ваши слабые места":
    "Kamchiliklaringizga mos aqlli mustahkamlash to'plamlari",
  "Новые функции и обновления — первыми":
    "Yangi funksiyalar va yangilanishlar — birinchi bo'lib",
  "Подписка Pro — 39 000 UZS / ⭐️ 150 Stars":
    "Pro obunasi — 39 000 UZS / ⭐️ 150 Stars",
  "Отменить Pro (Вернуться на Free)": "Pro'ni bekor qilish (Free'ga qaytish)",
  "Язык интерфейса": "Interfeys tili",
  "Выберите язык интерфейса приложения":
    "Ilova interfeys tilini tanlang",
  Русский: "Rus tili",

  // ── Dev / testers panel ──────────────────────────────
  "Тестирование для разработки": "Dasturchilar uchun test",
  "Сбросить счетчик ({a}/{b})": "Hisoblagichni tiklash ({a}/{b})",
  "Переключить на {plan}": "{plan}'ga o'tish",
  "Тестировщики ({n})": "Sinovchilar ({n})",
  Добавить: "Qo'shish",
  Удалить: "O'chirish",
  "профиль не найден": "profil topilmadi",
  "Тестировщики получают эти же кнопки в своём аккаунте, но не могут добавлять других. Ваш ID: {id} (разработчик)":
    "Sinovchilar o'z akkauntlarida shu tugmalarni ko'radi, lekin boshqalarni qo'sha olmaydi. Sizning ID: {id} (dasturchi)",

  // ── Paywall ──────────────────────────────────────────
  "ИИ-генератор": "AI-generator",
  "Пробный лимит": "Sinov limiti",
  "ИИ-суперсилы": "AI-superkuchlar",
  "ИИ-генератор колод — в подписке Pro":
    "To'plam AI-generatori — Pro obunasida",
  "Чтобы создавать персональные колоды с помощью ИИ, оформите подписку. Обучение, голосовые проверки и стартовые колоды остаются бесплатными.":
    "AI yordamida shaxsiy to'plamlar yaratish uchun obunani rasmiylashtiring. O'qish, ovozli tekshiruvlar va boshlang'ich to'plamlar bepul qoladi.",
  "Бесплатные AI-проверки закончились": "Bepul AI-tekshiruvlar tugadi",
  "Вы использовали 5 пробных AI-проверок на аккаунт. Оформите Pro — и продолжайте учиться без ограничений.":
    "Hisobingizdagi 5 ta sinov AI-tekshiruvini ishlatdingiz. Pro'ni rasmiylashtiring — cheklovsiz o'qishni davom ettiring.",
  "Откройте ИИ-суперсилы Pro": "Pro AI-superkuchlarini oching",
  "Генерация колод по любой теме, 60 голосовых проверок в день и умные закрепляющие колоды под ваши слабые места.":
    "Istalgan mavzuda to'plam generatsiyasi, kuniga 60 ta ovozli tekshiruv va kamchiliklaringizga mos aqlli mustahkamlash to'plamlari.",
  "Возможности тарифа Pro:": "Pro tarifi imkoniyatlari:",
  "Вернуться в Хаб": "Bosh sahifaga qaytish",
  "Сбросить лимит (Тест для разработки)": "Limitni tiklash (dasturchilar uchun test)",
  "Переход к оплате подписки Pro...": "Pro obunasi to'loviga o'tilmoqda...",
  "Не удалось инициировать оплату. Попробуйте позже.":
    "To'lovni boshlab bo'lmadi. Keyinroq urinib ko'ring.",

  // ── Daily limit stub ─────────────────────────────────
  "Вы отлично потрудились!": "Siz ajoyib ishladingiz!",
  "Хватит на сегодня!": "Bugun yetarli!",
  "Так много учили сегодня — рекомендуем отдохнуть до завтра. Голосовые проверки уже ждут вас завтра.":
    "Bugun juda ko'p o'rgandingiz — ertagacha dam olishni tavsiya qilamiz. Ovozli tekshiruvlar ertani kutmoqda.",
  "Все колоды на сегодня созданы. Отдохните — завтра снова можно генерировать новые.":
    "Bugungi barcha to'plamlar yaratildi. Dam oling — ertaga yangilarini generatsiya qilish mumkin.",
  "Лимит обновится в полночь — можно будет продолжить обучение в своём ритме 🌙":
    "Limit yarim tunda yangilanadi — o'z ritmingizda o'qishni davom ettirishingiz mumkin 🌙",
  "Хорошо, до завтра 👋": "Mayli, ertagacha 👋",
  "Продолжить без голоса": "Ovozsiz davom etish",
  "Продолжить без ИИ": "AI'siz davom etish",

  // ── Placement test ───────────────────────────────────
  "Мини-тест на уровень": "Daraja uchun mini-test",
  "Вопрос {i} из {n}": "Savol {i} / {n}",
  "Вопросы усложняются — это поможет точнее определить ваш уровень":
    "Savollar murakkashib boradi — bu darajangizni aniqroq belgilashga yordam beradi",
  "Выбрать уровень вручную": "Darajani qo'lda tanlash",
  "Пропустить тест": "Testni o'tkazib yuborish",
  "Языки обучения": "O'qish tillari",
  "Шаг перед мини-тестом на уровень": "Daraja mini-testidan oldingi qadam",
  "Выберите ваш родной язык и язык, который хотите изучать. Тест и колоды будут подобраны именно для этой пары.":
    "Ona tilingizni va o'rganmoqchi bo'lgan tilni tanlang. Test va to'plamlar aynan shu juftlik uchun tanlanadi.",
  "1. Родной язык:": "1. Ona tili:",
  "2. Язык изучения:": "2. O'rganiladigan til:",
  "Далее — мини-тест": "Keyingi — mini-test",
  "Уровень владения": "Til darajasi",
  "Выберите свой текущий уровень от 0 до 10. По мере обучения уровень будет расти автоматически.":
    "Joriy darajangizni 0 dan 10 gacha tanlang. O'qish davomida daraja avtomatik o'sadi.",
  "Уровень {n}/10 · {label}": "Daraja {n}/10 · {label}",
  "Сохранить уровень": "Darajani saqlash",
  "Вернуться к тесту": "Testga qaytish",
  "Тест пройден!": "Test topshirildi!",
  "Уровень сохранён!": "Daraja saqlandi!",
  "Правильных ответов: {s} из {t}": "To'g'ri javoblar: {s} / {t}",
  "Уровень выбран вручную": "Daraja qo'lda tanlandi",
  "Ваш уровень владения": "Sizning til darajangiz",
  "Мы подняли подходящие вам колоды наверх списка. Уровень будет расти автоматически по мере выученных слов, а тест можно пройти заново в любой момент.":
    "Sizga mos to'plamlarni ro'yxat yuqoriga ko'tardik. Daraja o'rganilgan so'zlar bilan avtomatik o'sadi, testni istalgan vaqtda qayta topshirish mumkin.",
  "Начать обучение": "O'qishni boshlash",
  Сохраняем: "Saqlanmoqda...",
  "Сохраняем...": "Saqlanmoqda...",

  // ── Onboarding & language switcher ───────────────────
  "Выберите родной язык": "Ona tilini tanlang",
  "Какой язык хотите изучать?": "Qaysi tilni o'rganmoqchisiz?",
  "Языковая пара обучения": "O'qish til juftligi",
  "Выберите ваш родной язык и язык, который хотите изучать":
    "Ona tilingizni va o'rganmoqchi bo'lgan tilni tanlang",
  "1. Ваш родной язык:": "1. Sizning ona tilingiz:",
  "Шаг {i} из 2 • {name}": "{i}-qadam / 2 • {name}",
  "Ona tili": "Ona tili",
  "O'rganish tili": "O'rganish tili",
  Сохранить: "Saqlash",
  Отмена: "Bekor qilish",
  "O'zbekcha": "O'zbekcha",
  "Узбекский": "O'zbek tili",
  "Английский": "Ingliz tili",
  "Итальянский": "Italyan tili",

  // ── Create deck modal ────────────────────────────────
  "Создать новую колоду": "Yangi to'plam yaratish",
  "Тема колоды": "To'plam mavzusi",
  "Например: Кафе и ресторан": "Masalan: Kafe va restoran",
  "Опишите, какие фразы и слова вы хотите изучать":
    "Qaysi ibora va so'zlarni o'rganishni xohlayotganingizni tasvirlab bering",
  Сгенерировать: "Generatsiya qilish",
  "Создаём колоду...": "To'plam yaratilmoqda...",
  "Колода создана!": "To'plam yaratildi!",
  "Начать обучение прямо сейчас": "Hozir o'qishni boshlash",

  // ── Loading / errors / dev ───────────────────────────
  "Загрузка профиля...": "Profil yuklanmoqda...",
  "Загрузка карточек...": "Kartochkalar yuklanmoqda...",
  "Тренажер языков • SM-2": "Til mashq treneri • SM-2",
  "Локальная разработка": "Lokal ishlab chiqish",
  "Запустите тестовую сессию для эмуляции пользователя.":
    "Foydalanuvchini emulyatsiya qilish uchun test sessiyasini ishga tushiring.",
  "Включить Dev-пользователя": "Dev-foydalanuvchini yoqish",
  Обновить: "Yangilash",
  "Повторить попытку": "Qayta urinib ko'rish",
  "Повторить ещё раз": "Yana takrorlash",
  "Ошибка загрузки": "Yuklashda xatolik",
  "Ошибка загрузки карточек": "Kartochkalarni yuklashda xatolik",
  "Не удалось загрузить карточек": "Kartochkalarni yuklab bo'lmadi",
  "Не удалось загрузить карточки": "Kartochkalarni yuklab bo'lmadi",
  "Не удалось распознать речь. Попробуйте напечатать ответ.":
    "Nutqni aniqlab bo'lmadi. Javobni yozib ko'ring.",
  "Ошибка распознавания речи. Введите ответ текстом.":
    "Nutqni aniqlashda xatolik. Javobni matn bilan kiriting.",
  Ошибка: "Xatolik",
  "Вернуться на главную": "Bosh sahifaga qaytish",
  "Карточки не найдены": "Kartochkalar topilmadi",
  "В этой колоде пока нет карточек для тренировки.":
    "Bu to'plamda hozircha mashq uchun kartochkalar yo'q.",
  Колода: "To'plam",
  "{i} из {n}": "{i} / {n}",
  Верно: "To'g'ri",
  "Грамматическое правило": "Grammatik qoida",
  "Текст не совпал с карточкой": "Matn kartochka bilan mos kelmadi",
  "Распознано:": "Aniqlandi:",
  "Возможно, микрофон срезал звук или была опечатка. Вы можете наговорить ответ еще раз.":
    "Ehtimol, mikrofon ovozni kesdi yoki xato yozildi. Javobni yana gapirib ko'rishingiz mumkin.",
  "Ручная корректировка (Микрофон заблокирован)":
    "Qo'lda tuzatish (mikrofon bloklangan)",
  "Мы услышали:": "Biz eshitdik:",
  "Подправьте пару букв в поле ввода ниже или подтвердите ответ как есть.":
    "Quyidagi maydonda bir nechta harfni tuzating yoki javobni qanday bo'lsa shunday tasdiqlang.",
  "Идет запись голоса... Нажмите кнопку для остановки":
    "Ovoz yozilmoqda... To'xtatish uchun tugmani bosing",
  "Распознаем речь (Gemini)...": "Nutq aniqlanmoqda (Gemini)...",
  "Отредактируйте распознанный текст:": "Aniqlangan matnni tahrirlang:",
  "Исправьте текст...": "Matnni tuzating...",
  "Оцените, насколько легко было вспомнить:":
    "Qanchalik oson eslashingizni baholang:",
  Снова: "Qaytadan",
  Забыл: "Unutdim",
  Трудно: "Qiyin",
  "С трудом": "Zo'riqish bilan",
  Хорошо: "Yaxshi",
  Нормально: "Normal",
  Легко: "Oson",
  Сразу: "Zudlik bilan",
  "Запись звука не поддерживается в этом браузере или требуется HTTPS.":
    "Ovoz yozish bu brauzerda qo'llab-quvvatlanmaydi yoki HTTPS kerak.",
  "Доступ к микрофону отклонен. Разрешите доступ в настройках Telegram или браузера.":
    "Mikrofonga ruxsat rad etildi. Telegram yoki brauzer sozlamalarida ruxsat bering.",
  "Не удалось включить микрофон. Попробуйте ввести ответ текстом.":
    "Mikrofoni yoqib bo'lmadi. Javobni matn bilan kiriting.",

  // ── Settings messages ────────────────────────────────
  Пользователь: "Foydalanuvchi",
  "Тариф Pro успешно активирован!": "Pro tarifi muvaffaqiyatli faollashtirildi!",
  "Переключено на базовый тариф Free": "Boshlang'ich Free tarifiga o'tildi",
  "Не удалось обновить тариф": "Tarifni yangilab bo'lmadi",
  "Счетчик AI-проверок сброшен на 0":
    "AI-tekshiruvlar hisoblagichi 0 ga tiklandi",
  "Не удалось сбросить счетчик": "Hisoblagichni tiklab bo'lmadi",
  "Не удалось инициировать оплату.": "To'lovni boshlab bo'lmadi.",
  "Тестировщик добавлен: {who}": "Sinovchi qo'shildi: {who}",
  "Не удалось добавить тестировщика": "Sinovchini qo'shib bo'lmadi",
  "Тестировщик {id} удалён": "Sinovchi {id} o'chirildi",
  "Не удалось удалить тестировщика": "Sinovchini o'chirib bo'lmadi",
  Закрыть: "Yopish",

  // ── Create deck modal extras ─────────────────────────
  "Создать колоду с помощью ИИ": "AI yordamida to'plam yaratish",
  "Укажите любую тему, и репетитор сгенерирует 5–7 карточек с примерами и правилами.":
    "Istalgan mavzuni kiriting — repetitor misollar va qoidalar bilan 5-7 ta kartochka yaratadi.",
  "Рекомендуемые темы:": "Tavsiya etilgan mavzular:",
  "Поход на базар Чорсу": "Chorsu bozoriga sayohat",
  "Заказ плова и чая в чайхане": "Choyxonada osh va choy buyurtma qilish",
  "Поездка на такси в Ташкенте": "Toshkentda taksi sayohati",
  "Глаголы движения (bor-, kel-)": "Harakat fe'llari (bor-, kel-)",
  "Знакомство и вежливые фразы": "Tanishuv va xushmuomalalik iboralari",
  "Или введите свою тему:": "Yoki o'z mavzuingizni kiriting:",
  "например: Разговор в аэропорту, Числительные...":
    "masalan: Aeroportda suhbat, Sonlar...",
  "ИИ составляет карточки и грамматические пояснения...":
    "AI kartochkalar va grammatik tushuntirishlarni tuzadi...",
  "Генерируем...": "Yaratilmoqda...",
  "Создать и начать тренировку": "Yaratish va mashqni boshlash",
  "Не удалось сгенерировать колоду": "To'plamni generatsiya qilib bo'lmadi",
  "Ошибка генерации": "Generatsiya xatosi",

  // ── Onboarding / language switcher extras ────────────
  "Русский язык": "Rus tili",
  "Пояснения и правила будут на русском":
    "Tushuntirishlar va qoidalar rus tilida bo'ladi",
  Назад: "Orqaga",
  "Узбекский язык • Разговорный и грамматика":
    "O'zbek tili • Suhbat va grammatika",
  "Английский язык • Для работы и путешествий":
    "Ingliz tili • Ish va sayohat uchun",
  "Итальянский язык • Музыка, кухня и путешествия":
    "Italyan tili • Musiqa, oshxona va sayohat",
  "O'zbekcha (Узбекский)": "O'zbekcha (O'zbek tili)",
  "English (Английский)": "English (Ingliz tili)",
  "Italiano (Итальянский)": "Italiano (Italyan tili)",
  "Русский (Rus tili)": "Rus tili",
  "Сохранение...": "Saqlanmoqda...",
  "Применить языковую пару": "Til juftligini qo'llash",

  // ── Today's mixed deck ───────────────────────────────
  "Колода на сегодня": "Bugungi to'plam",
  "Микс карт из ваших колод под ваш уровень":
    "Darajangizga mos to'plamlaringizdan aralashtirilgan kartochkalar",
  "Перемешанные карты из ваших колод под ваш уровень сложности":
    "Darajangizga mos to'plamlaringizdan aralashtirilgan kartochkalar",
  Уровень: "Daraja",
};
