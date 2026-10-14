import type { SeedDeck } from "./seed-data";

export const EXTRA_RU_UZ: SeedDeck[] = [
  {
    title: "Семья и близкие",
    description: "Члены семьи, родственники и уважительные обращения",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 1,
    cards: [
      {
        front: "Мама",
        back: "Ona (Oyi)",
        rule_description: "Ona — литературное «мать/мама»; в семье в Ташкенте к маме часто обращаются «Oyi» или «Oyijon».",
      },
      {
        front: "Папа",
        back: "Ota (Dada)",
        rule_description: "Ota — отец; в семье дети обычно обращаются к папе «Dada» или «Dadajon».",
      },
      {
        front: "Старший брат (и вежливое обращение к мужчине)",
        back: "Aka",
        rule_description: "Aka — старший брат; также стандартное уважительное обращение к мужчине старше вас (например, к водителю или продавцу).",
      },
      {
        front: "Старшая сестра (и вежливое обращение к женщине)",
        back: "Opa",
        rule_description: "Opa — старшая сестра; уважительное обращение к девушке или женщине старше вас.",
      },
      {
        front: "Младший брат (и обращение к парню младше)",
        back: "Uka",
        rule_description: "Uka — младший брат; ласково-уважительно — «ukam» (мой братишка).",
      },
      {
        front: "Младшая сестра (и обращение к девушке младше)",
        back: "Singil",
        rule_description: "Singil — младшая сестра; при обращении с притяжательным суффиксом выпадает «i»: «singlim» (сестрёнка).",
      },
      {
        front: "Бабушка",
        back: "Buvi",
        rule_description: "Buvi — бабушка; ласковое обращение — «Buvijon».",
      },
      {
        front: "Дедушка",
        back: "Bobo (Buva)",
        rule_description: "Bobo (или ташкентское «Buva») — дедушка; уважительно к пожилому мужчине — «Otaxon» или «Bobo».",
      },
      {
        front: "Родственники",
        back: "Qarindoshlar",
        rule_description: "Qarindosh (родственник) + -lar (мн. ч.); близкие люди — «yaqinlar».",
      },
    ],
  },
  {
    title: "Дом и бытовые вещи",
    description: "Жильё, комнаты и предметы домашнего обихода",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 1,
    cards: [
      {
        front: "Дом (и двор частного дома)",
        back: "Uy (Hovli)",
        rule_description: "Uy — дом или квартира; частный дом с внутренним двором называют «hovli».",
      },
      {
        front: "Комната",
        back: "Xona",
        rule_description: "Xona (комната): спальня — «yotoqxona», гостиная — «mehmonxona».",
      },
      {
        front: "Кухня (и столовая/кафе)",
        back: "Oshxona",
        rule_description: "Oshxona (от «osh» — еда/плов + «xona» — помещение): означает и домашнюю кухню, и городскую столовую.",
      },
      {
        front: "Дверь",
        back: "Eshik",
        rule_description: "Eshik (дверь); порог дома по-узбекски — «ostona» или «bo'sag'a».",
      },
      {
        front: "Окно",
        back: "Deraza",
        rule_description: "Deraza (окно); зеркало — «ko'zgu» или «oyna» (словом «oyna» в разговорной речи называют и оконное стекло).",
      },
      {
        front: "Стол (и накрытый дастархан)",
        back: "Stol (Dasturxon)",
        rule_description: "Stol — мебель; накрытый для угощения стол называют «dasturxon».",
      },
      {
        front: "Стул",
        back: "Stul (Kursi)",
        rule_description: "В быту говорят «stul»; традиционный стул или табурет — «kursi», а топчан во дворе — «so'ri».",
      },
      {
        front: "Ключ и замок",
        back: "Kalit va qulf",
        rule_description: "Kalit (ключ), qulf (замок); «eshikni qulflamoq» — запереть дверь на ключ.",
      },
      {
        front: "Ковёр",
        back: "Gilam",
        rule_description: "Gilam (ковёр) — важная часть традиционного узбекского дома.",
      },
    ],
  },
  {
    title: "Погода и природа",
    description: "Погода, природные явления и времена года",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 1,
    cards: [
      {
        front: "Погода",
        back: "Ob-havo",
        rule_description: "Персидское заимствование («вода и воздух»): «Bugun ob-havo qanday?» — Какая сегодня погода?",
      },
      {
        front: "Солнце",
        back: "Quyosh",
        rule_description: "Quyosh (солнце); солнечный день — «quyoshli kun».",
      },
      {
        front: "Дождь",
        back: "Yomg'ir",
        rule_description: "Yomg'ir (дождь); «Yomg'ir yog'yapti» — идёт дождь (букв. «дождь сыплется»).",
      },
      {
        front: "Снег",
        back: "Qor",
        rule_description: "Qor (снег); «Qor yog'yapti» — идёт снег.",
      },
      {
        front: "Жарко / горячий",
        back: "Issiq",
        rule_description: "Issiq (жарко, горячий): «Havo juda issiq» — погода очень жаркая; «issiq non» — горячая лепёшка.",
      },
      {
        front: "Холодно / холодный",
        back: "Sovuq",
        rule_description: "Sovuq (холодно, холодный); «Sovuq tushdi» — похолодало (наступили холода).",
      },
      {
        front: "Ветер",
        back: "Shamol",
        rule_description: "Shamol (ветер); «Shamol esyapti» — дует ветер; простудиться — «shamollamoq».",
      },
      {
        front: "Дерево и гора",
        back: "Daraxt va tog'",
        rule_description: "Daraxt (дерево), tog' (гора); «tog'ga chiqmoq» — подняться в горы.",
      },
    ],
  },
  {
    title: "Здоровье и части тела",
    description: "Части тела, самочувствие и фразы для врача и аптеки",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 1,
    cards: [
      {
        front: "Голова",
        back: "Bosh",
        rule_description: "Bosh (голова, а также «начало/главный»); «Boshim og'riyapti» — у меня болит голова.",
      },
      {
        front: "Рука (вся рука и кисть)",
        back: "Qo'l",
        rule_description: "Qo'l означает и кисть, и всю руку; здороваться за руку — «qo'l berib ko'rishmoq».",
      },
      {
        front: "Нога (вся нога и стопа)",
        back: "Oyoq",
        rule_description: "Oyoq (нога); обувь — «oyoq kiyim» (букв. «одежда для ног»).",
      },
      {
        front: "Глаз",
        back: "Ko'z",
        rule_description: "Ko'z (глаз), мн. ч. — «ko'zlar»; очки — «ko'zoynak».",
      },
      {
        front: "У меня болит живот",
        back: "Qornim og'riyapti",
        rule_description: "Qorin (живот, при склонении выпадает «i» -> qornim) + og'riyapti (болит сейчас).",
      },
      {
        front: "У меня температура (жар)",
        back: "Isitmam bor",
        rule_description: "Isitma (жар/температура) + -m (моя) + bor (есть).",
      },
      {
        front: "Мне нужен врач",
        back: "Menga shifokor kerak",
        rule_description: "Menga (мне) + shifokor (врач) + kerak (нужен).",
      },
      {
        front: "Лекарство и аптека",
        back: "Dori va dorixona",
        rule_description: "Dori (лекарство), dorixona (аптека); принимать лекарство — «dori ichmoq» (букв. «пить лекарство»).",
      },
      {
        front: "Вызовите скорую / врача",
        back: "Tez yordam (shifokor) chaqiring",
        rule_description: "Tez yordam — скорая помощь; chaqiring — вызовите/позовите (вежл.).",
      },
    ],
  },
  {
    title: "Еда и продукты",
    description: "Продукты питания, заказ еды в чайхане и базовая лексика кухни",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 2,
    cards: [
      {
        front: "Хлеб (узбекская лепёшка)",
        back: "Non",
        rule_description: "Non — священный продукт в Узбекистане: лепёшку ломают руками («non sindirmoq») и никогда не кладут лицевой стороной вниз.",
      },
      {
        front: "Мясо (говядина и баранина)",
        back: "Go'sht (mol go'shti / qo'y go'shti)",
        rule_description: "Go'sht — мясо; mol go'shti — говядина, qo'y go'shti — баранина, tovuq go'shti — курица.",
      },
      {
        front: "Вода",
        back: "Suv",
        rule_description: "Suv (вода); «gazsiz suv» — вода без газа, «muzdek suv» — ледяная вода.",
      },
      {
        front: "Молоко",
        back: "Sut",
        rule_description: "Sut (молоко); кислое молоко / катык — «qatiq».",
      },
      {
        front: "Зелёный и чёрный чай",
        back: "Ko'k choy va qora choy",
        rule_description: "В Ташкенте по умолчанию чаще пьют зелёный чай — «ko'k choy» (с лимоном — «limon choy»).",
      },
      {
        front: "Я проголодался",
        back: "Qornim ochdi (Och qoldim)",
        rule_description: "Qornim (мой живот) + ochdi (проголодался). Не путать со словом «ochdim» («я открыл»)!",
      },
      {
        front: "Очень вкусно! (И спасибо после еды)",
        back: "Juda mazali! (Rahmat, juda shirin bo'libdi!)",
        rule_description: "Mazali (или shirin) — вкусный. Хозяину или повару говорят: «Qo'lingiz dard ko'rmasin!» (Пусть ваши руки не знают боли!).",
      },
    ],
  },
  {
    title: "Время и вопросительные слова",
    description: "Дни, время и полная система ключевых вопросительных слов",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 2,
    cards: [
      {
        front: "Сегодня, завтра и вчера",
        back: "Bugun, ertaga va kecha",
        rule_description: "Bugun (сегодня), ertaga (завтра), kecha (вчера). Утром — «ertalab», вечером — «kechqurun».",
      },
      {
        front: "Что?",
        back: "Nima?",
        rule_description: "Nima — что; «Nima gap?» — Что нового? / Как дела?",
      },
      {
        front: "Кто?",
        back: "Kim?",
        rule_description: "Kim — кто (только о людях); «Bu kim?» — Кто это?",
      },
      {
        front: "Где? / Куда? / Откуда?",
        back: "Qayerda? / Qayerga? / Qayerdan?",
        rule_description: "Корень qayer (где) + падежные суффиксы: -da (где), -ga (куда), -dan (откуда).",
      },
      {
        front: "Когда?",
        back: "Qachon?",
        rule_description: "Qachon — когда.",
      },
      {
        front: "Как? / Какой?",
        back: "Qanday? (Qanaqa?)",
        rule_description: "Qanday — как / какой; в разговорной речи часто звучит как «Qanaqa?».",
      },
      {
        front: "Почему? (Зачем?)",
        back: "Nima uchun? (Nega?)",
        rule_description: "Nima uchun (букв. «для чего») или короткое разговорное «Nega?».",
      },
      {
        front: "Который час? (Сколько времени?)",
        back: "Soat nechchi bo'ldi?",
        rule_description: "Soat (час/часы) + nechchi (сколько) + bo'ldi (стало).",
      },
      {
        front: "Сейчас и потом (позже)",
        back: "Hozir va keyin (keyinroq)",
        rule_description: "Hozir (сейчас), keyin (потом), keyinroq (попозже).",
      },
    ],
  },
  {
    title: "Ориентация в городе и такси",
    description: "Фразы для передвижения по городу, метро и общения с таксистом",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 2,
    cards: [
      {
        front: "Где находится метро?",
        back: "Metro qayerda joylashgan?",
        rule_description: "В быту достаточно короткого: «Metro qayerda?» (Где метро?).",
      },
      {
        front: "Остановите здесь, пожалуйста",
        back: "Shu yerda to'xtating, iltimos",
        rule_description: "Shu yerda (вот здесь) + to'xtating (остановите, вежл.).",
      },
      {
        front: "Поверните направо",
        back: "O'ngga buriling (O'ng qo'lga haydang)",
        rule_description: "O'ng (правый) + -ga (направление) + buriling (повернитесь/сверните). Таксистам часто говорят «O'ng qo'lda» (по правую руку).",
      },
      {
        front: "Поверните налево",
        back: "Chapga buriling",
        rule_description: "Chap (левый) + -ga (налево) + buriling (поверните).",
      },
      {
        front: "Езжайте прямо",
        back: "To'g'riga haydang (To'g'ri yuring)",
        rule_description: "To'g'ri (прямо) + haydang (ведите машину) или yuring (идите/езжайте).",
      },
      {
        front: "Я скину локацию в Telegram",
        back: "Telegramdan lokatsiya tashlayman",
        rule_description: "В Узбекистане адрес почти всегда отправляют геолокацией: «lokatsiya tashlamoq» (скинуть локацию).",
      },
    ],
  },
  {
    title: "Связь, интернет и гаджеты",
    description: "Повседневные фразы о телефоне, интернете, зарядке и мессенджерах",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 2,
    cards: [
      {
        front: "Какой здесь пароль от Wi-Fi?",
        back: "Wi-Fi paroli qanaqa?",
        rule_description: "Parol (пароль) + -i (притяжат. суффикс) + qanaqa (какой).",
      },
      {
        front: "У меня разрядился телефон",
        back: "Telefonimning quvvati tugadi (Zaryadim o'chdi)",
        rule_description: "Quvvat (заряд/энергия) + tugadi (закончился); в быту: «Telefonim o'chib qoldi» (телефон выключился).",
      },
      {
        front: "У вас есть зарядка?",
        back: "Sizda zaryadka (quvvatlagich) bormi?",
        rule_description: "Sizda (у вас) + bormi (есть ли?).",
      },
      {
        front: "Интернет работает медленно",
        back: "Internet sekin ishlayapti",
        rule_description: "Sekin (медленно) + ishlayapti (работает сейчас). Быстро — «tez».",
      },
      {
        front: "Напишите мне в Telegram",
        back: "Menga Telegramdan yozing",
        rule_description: "Menga (мне) + Telegram-dan (через/из Телеграма) + yozing (напишите).",
      },
      {
        front: "Переведу деньги на карту (Click / Payme)",
        back: "Pulni kartaga o'tkazib beraman",
        rule_description: "Pulni (деньги) + kartaga (на карту) + o'tkazib beraman (переведу).",
      },
    ],
  },
  {
    title: "Одежда и внешность",
    description: "Одежда, обувь, внешность и примерка",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 2,
    cards: [
      {
        front: "Я хочу купить одежду",
        back: "Men kiyim sotib olmoqchiman",
        rule_description: "Kiyim (одежда) + sotib olmoq (покупать) + -moqchiman (намерен / хочу).",
      },
      {
        front: "Где магазин одежды?",
        back: "Kiyim do'koni qayerda?",
        rule_description: "Kiyim do'koni (магазин одежды) + qayerda (где).",
      },
      {
        front: "Мне нужен головной убор (шапка / кепка)",
        back: "Menga bosh kiyim kerak",
        rule_description: "Bosh kiyim — любой головной убор (шапка — «shapka», тюбетейка — «do'ppi»).",
      },
      {
        front: "Эта обувь мне велика",
        back: "Bu oyoq kiyim menga katta",
        rule_description: "Oyoq kiyim — обувь в целом; etiklar — сапоги/высокие ботинки, tufli — туфли, krossovka — кроссовки.",
      },
      {
        front: "Покажите, пожалуйста, эту рубашку (платье)",
        back: "Iltimos, shu ko'ylakni ko'rsating",
        rule_description: "Слово «ko'ylak» в узбекском означает и мужскую рубашку, и женское платье.",
      },
      {
        front: "Какой у вас размер?",
        back: "Sizning o'lchamingiz qanaqa? (Razmeringiz nechchi?)",
        rule_description: "Литературно — «o'lcham», на рынке и в магазине часто спрашивают «Razmeringiz nechchi?».",
      },
      {
        front: "Эта рубашка мне нравится",
        back: "Bu ko'ylak menga yoqadi",
        rule_description: "Yoqmoq (нравиться): menga yoqadi (мне нравится), menga yoqmaydi (мне не нравится).",
      },
      {
        front: "У него красивая одежда",
        back: "Uning chiroyli kiyimi bor",
        rule_description: "Chiroyli (красивый) + kiyimi (его одежда) + bor (есть).",
      },
      {
        front: "Эта куртка мне очень идёт",
        back: "Bu kurtka menga juda yarashadi",
        rule_description: "Yarashmoq — идти к лицу, смотреться гармонично.",
      },
    ],
  },
  {
    title: "Работа и учёба",
    description: "Офис, производство, занятия и рабочие дела",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 2,
    cards: [
      {
        front: "Я работаю в офисе (на заводе)",
        back: "Men ofisda (zavodda) ishlayman",
        rule_description: "Суффикс места -da (в/на): ofisda (в офисе), zavodda (на заводе), sexda (в цеху).",
      },
      {
        front: "Я учусь в университете",
        back: "Men universitetda o'qiyman",
        rule_description: "Universitetda (в университете) + o'qiyman (учусь).",
      },
      {
        front: "У меня сегодня много работы",
        back: "Bugun menda ish ko'p (Bugun ishim ko'p)",
        rule_description: "«Ishim ko'p» (моей работы много) звучит максимально естественно.",
      },
      {
        front: "Во сколько начинается работа (урок)?",
        back: "Ish (dars) soat nechchida boshlanadi?",
        rule_description: "Boshlanmoq (начинаться) -> boshlanadi (начинается); заканчивается — «tugaydi».",
      },
      {
        front: "Я пишу сообщение (сейчас)",
        back: "Men xabar yozyapman (xat yozmoqdaman)",
        rule_description: "В живой речи для текущего момента используют «yozyapman», в официальных текстах — «yozmoqdaman».",
      },
      {
        front: "Мой руководитель строгий",
        back: "Mening rahbarim (boshlig'im) qattiqqo'l",
        rule_description: "Rahbar / boshliq (руководитель, начальник) + qattiqqo'l (строгий, досл. «твёрдая рука»).",
      },
      {
        front: "Я сдаю экзамен",
        back: "Men imtihon topshiryapman",
        rule_description: "Imtihon topshirmoq — сдавать экзамен; пройти испытание/тест — «sinovdan o'tmoq».",
      },
      {
        front: "Мы обсуждаем новый проект",
        back: "Biz yangi loyihani muhokama qilyapmiz",
        rule_description: "Loyiha (проект) + -ni (вин. п.) + muhokama qilmoq (обсуждать).",
      },
    ],
  },
  {
    title: "Хобби и досуг",
    description: "Увлечения, спорт, походы в горы и свободное время",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 2,
    cards: [
      {
        front: "Я люблю читать книги",
        back: "Men kitob o'qishni yaxshi ko'raman",
        rule_description: "Отглагольное имя на -sh с винительным падежом (o'qishni) + yaxshi ko'raman (люблю).",
      },
      {
        front: "Я играю в футбол (в игры)",
        back: "Men futbol (o'yin) o'ynayman",
        rule_description: "O'ynamoq — играть (в спорт, настольные или компьютерные игры).",
      },
      {
        front: "Я слушаю музыку",
        back: "Men musiqa tinglayman (eshitaman)",
        rule_description: "Tinglamoq — внимательно слушать; eshitmoq — слышать и слушать в разговорной речи.",
      },
      {
        front: "Мы играем в шахматы",
        back: "Biz shaxmat o'ynaymiz",
        rule_description: "Shaxmat (шахматы) + o'ynaymiz (мы играем).",
      },
      {
        front: "Чем вы занимаетесь в свободное время?",
        back: "Bo'sh vaqtingizda nima qilasiz?",
        rule_description: "Bo'sh vaqt (свободное время) + -ingizda (в ваше) + nima qilasiz (что делаете).",
      },
      {
        front: "В выходные мы ходим в горы",
        back: "Dam olish kunlari tog'ga chiqamiz",
        rule_description: "Dam olish kunlari (выходные дни) + tog'ga chiqmoq (подниматься/выезжать в горы).",
      },
      {
        front: "Я смотрю фильм (видео)",
        back: "Men kino (video) ko'ryapman",
        rule_description: "Ko'rmoq (смотреть) + -yapman (сейчас).",
      },
      {
        front: "Давайте встретимся завтра!",
        back: "Ertaga ko'rishaylik! (uchrashaylik!)",
        rule_description: "Суффикс -aylik выражает призыв «давайте сделаем»: ko'rishaylik (давайте увидимся).",
      },
    ],
  },
  {
    title: "Транспорт: аэропорт и вокзал",
    description: "Фразы для аэропорта, железнодорожного вокзала и междугородних поездок",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 2,
    cards: [
      {
        front: "Где находится аэропорт (вокзал)?",
        back: "Aeroport (vokzal) qayerda?",
        rule_description: "Вопрос о местонахождении с суффиксом -da.",
      },
      {
        front: "Мне нужен билет до Ташкента (Самарканда)",
        back: "Menga Toshkentgacha (Samarqandgacha) chipta kerak",
        rule_description: "Суффикс -gacha означает предел («вплоть до»): Toshkentgacha — до Ташкента.",
      },
      {
        front: "Когда отправляется поезд («Афросиаб»)?",
        back: "Poyezd qachon jo'naydi?",
        rule_description: "Jo'namoq — отправляться в путь; прибывать — «yetib kelmoq».",
      },
      {
        front: "Один билет, пожалуйста",
        back: "Bitta chipta, iltimos",
        rule_description: "Слово «bitta» (bir + -ta) используется при заказе 1 штуки чего-либо.",
      },
      {
        front: "Откуда отправляется автобус (такси)?",
        back: "Avtobus qayerdan jo'naydi (qatnaydi)?",
        rule_description: "Qayerdan — откуда; qatnamoq — регулярно курсировать по маршруту.",
      },
      {
        front: "Мой рейс задерживается",
        back: "Mening reysim kechikyapti",
        rule_description: "Kechikmoq — опаздывать, задерживаться.",
      },
      {
        front: "Где камера хранения багажа?",
        back: "Yukxona (yuk saqlash joyi) qayerda?",
        rule_description: "Yuk (груз/багаж) + xona (комната).",
      },
      {
        front: "Этот автобус едет до вокзала?",
        back: "Bu avtobus vokzalgacha boradimi?",
        rule_description: "Vokzalgacha (до вокзала) + boradimi (идёт ли?).",
      },
    ],
  },
  {
    title: "Грамматика: модальные конструкции и вежливость",
    description: "Выражение намерения (-moqchi), необходимости (kerak) и возможности (-a olmoq)",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 3,
    cards: [
      {
        front: "Я собираюсь (хочу) поехать в Самарканд",
        back: "Men Samarqandga bormoqchiman",
        rule_description: "Суффикс намерения -moqchi + личное окончание -man: выражает чёткий план или желание.",
      },
      {
        front: "Мне хочется пить (я хочу выпить воды)",
        back: "Suv ichgim kelyapti (Suv ichishni xohlayman)",
        rule_description: "Суффикс -gi/-ki + притяжательное окончание + kelyapti передаёт естественное физическое желание («ichgim kelyapti» — хочется пить, «uxlagim kelyapti» — хочется спать).",
      },
      {
        front: "Мне нужно работать",
        back: "Men ishlashim kerak (Menga ishlash kerak)",
        rule_description: "Отглагольное имя на -(i)sh + kerak (нужно).",
      },
      {
        front: "Я должен завтра прийти",
        back: "Men ertaga kelishim kerak (shart)",
        rule_description: "Kelishim kerak — мне нужно прийти; kelishim shart — я строго обязан прийти.",
      },
      {
        front: "Я умею (могу) говорить по-узбекски",
        back: "Men o'zbekcha gapira olaman",
        rule_description: "Деепричастие на -a/-y + вспомогательный глагол olmoq: gapira olaman (могу говорить).",
      },
      {
        front: "Я не смогу прийти",
        back: "Men kela olmayman",
        rule_description: "В отрицании способности меняется только вспомогательный глагол: kel-a ol-may-man (в разг. речи сливается в «kelolmayman»).",
      },
      {
        front: "Вы не могли бы мне помочь?",
        back: "Menga yordam bera olasizmi?",
        rule_description: "Yordam bermoq (помогать) + -a olasizmi (можете ли Вы?).",
      },
      {
        front: "Можно мне войти?",
        back: "Kirsam bo'ladimi? (Mumkinmi?)",
        rule_description: "Условная форма kir-sam (если я войду) + bo'ladimi (будет ли можно?).",
      },
      {
        front: "Мы хотим встретиться с вами",
        back: "Biz siz bilan uchrashmoqchimiz",
        rule_description: "Siz bilan (с вами) + uchrashmoqchimiz (намерены/хотим встретиться).",
      },
    ],
  },
  {
    title: "Наречия и послелоги места",
    description: "Падежи места (-da, -ga, -dan) и пространственные послелоги (ustida, ostida, yonida)",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 3,
    cards: [
      {
        front: "Я живу в Ташкенте (в Навои)",
        back: "Men Toshkentda (Navoiyda) yashayman",
        rule_description: "Местный падеж -da отвечает на вопросы «где? / у кого? / когда?».",
      },
      {
        front: "Я иду на рынок",
        back: "Men bozorga ketyapman",
        rule_description: "Направительный падеж -ga (куда? / кому?): bozor + ga.",
      },
      {
        front: "Я вернулся с работы (из школы)",
        back: "Men ishdan (maktabdan) keldim",
        rule_description: "Исходный падеж -dan (откуда? / от кого? / из чего?): ish + dan.",
      },
      {
        front: "Он стоит у двери (рядом с дверью)",
        back: "U eshik yonida (oldida) turibdi",
        rule_description: "Послелог «yonida» (сбоку/возле) или «oldida» (перед/у).",
      },
      {
        front: "Книга лежит на столе",
        back: "Kitob stol ustida turibdi (yotibdi)",
        rule_description: "Ustida — на поверхности чего-либо (от «ust» — верх).",
      },
      {
        front: "Кошка под кроватью",
        back: "Mushuk karavot ostida (tagida)",
        rule_description: "Ostida (или разговорное «tagida») — под чем-либо.",
      },
      {
        front: "Он работает далеко от города",
        back: "U shahardan uzoqda ishlaydi",
        rule_description: "Конструкция удаления требует падежа -dan: shahardan uzoqda (далеко от города), uydan yaqinda (близко от дома).",
      },
      {
        front: "Дети играют во дворе",
        back: "Bolalar hovlida o'ynashyapti",
        rule_description: "Hovlida (во дворе) + o'ynashyapti (играют вместе).",
      },
    ],
  },
  {
    title: "Союзы и связки для живой речи",
    description: "Слова-связки для построения сложных предложений и аргументации",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 3,
    cards: [
      {
        front: "Потому что...",
        back: "Chunki... (Sababi...)",
        rule_description: "Ставится в начале придаточного предложения: «Men kelmadim, chunki band edim» (Я не пришёл, потому что был занят).",
      },
      {
        front: "Поэтому / По этой причине",
        back: "Shuning uchun",
        rule_description: "Буквально «для этого»: «Ish ko'p, shuning uchun kech qoldim» (Работы много, поэтому я задержался).",
      },
      {
        front: "Если... (условие)",
        back: "Agar... (+ глагол на -sa)",
        rule_description: "Требует условного наклонения на -sa: «Agar vaqtingiz bo'lsa» (Если у вас будет время).",
      },
      {
        front: "Но / Однако",
        back: "Lekin / Ammo",
        rule_description: "Lekin — самое частое разговорное «но»; ammo и biroq — чуть более литературные синонимы.",
      },
      {
        front: "Сначала..., а потом...",
        back: "Avval (boshida)..., keyin...",
        rule_description: "Avval o'ylab ko'ring, keyin ayting — Сначала подумайте, потом скажите.",
      },
      {
        front: "Например",
        back: "Masalan (Misol uchun)",
        rule_description: "Используется для вводных примеров точно так же, как в русском.",
      },
      {
        front: "Конечно / Разумеется!",
        back: "Albatta! (Bemalol!)",
        rule_description: "Albatta — конечно/обязательно; «Bemalol!» — пожалуйста, без проблем, не стесняйтесь!",
      },
      {
        front: "По-моему / На мой взгляд",
        back: "Menimcha (Mening fikrimcha)",
        rule_description: "Menimcha — короткая разговорная форма; mening fikrimcha — «по моему мнению».",
      },
    ],
  },
  {
    title: "Деловое общение",
    description: "Встречи, переговоры, переписка и телефонный этикет",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 3,
    cards: [
      {
        front: "Давайте назначим встречу",
        back: "Keling, uchrashuv belgilaymiz",
        rule_description: "Keling (давайте) + uchrashuv (встреча) + belgilaymiz (назначим).",
      },
      {
        front: "Я отправлю вам документ (письмо)",
        back: "Men sizga hujjatni (xatni) yuboraman",
        rule_description: "Hujjat (документ), xat (письмо), yubormoq (отправлять).",
      },
      {
        front: "Обсудим условия договора",
        back: "Shartnoma shartlarini muhokama qilamiz",
        rule_description: "Shartnoma (договор/контракт) + shartlari (его условия) + -ni (вин. падеж).",
      },
      {
        front: "Перезвоните мне, пожалуйста",
        back: "Menga qo'ng'iroq qiling, iltimos",
        rule_description: "Qo'ng'iroq qilmoq (звонить); в разговорной речи также говорят «telefon qiling».",
      },
      {
        front: "Какова ваша окончательная цена?",
        back: "Oxirgi narxingiz qanday? (Bo'lishi qancha?)",
        rule_description: "Oxirgi narx — последняя (окончательная) цена; на рынке спрашивают «Oxiri (bo'lishi) qancha?».",
      },
      {
        front: "Мы готовы к сотрудничеству (переговорам)",
        back: "Biz hamkorlikka (muzokaraga) tayyormiz",
        rule_description: "Tayyor (готовый) + -miz (мы). При прибавлении -ga к слову на «-k» получается «hamkorlikka».",
      },
      {
        front: "Благодарю за сотрудничество",
        back: "Hamkorlik uchun rahmat",
        rule_description: "Hamkorlik (сотрудничество) + uchun (за) + rahmat.",
      },
      {
        front: "Всего доброго, будьте здоровы!",
        back: "Xayr, sog'-salomat bo'ling!",
        rule_description: "Sog' bo'ling / Sog'-salomat bo'ling — тёплое и уважительное завершение любого разговора.",
      },
    ],
  },
  {
    title: "Пословицы и устойчивые выражения",
    description: "Узбекские пословицы (maqollar) и крылатые фразы",
    native_language: "ru",
    target_language: "uz",
    language_pair: "ru-uz",
    level: 3,
    cards: [
      {
        front: "Без труда не вытащишь и рыбку из пруда",
        back: "Mehnatsiz rohat bo'lmas (Mehnatsiz ne'mat bo'lmaydi)",
        rule_description: "Дословно: «Без труда не бывает удовольствия (блага)».",
      },
      {
        front: "Семь раз отмерь, один раз отрежь",
        back: "Yetti o'lchab, bir kes",
        rule_description: "Полный узбекский эквивалент русской пословицы: yetti (семь) + o'lchab (отмерив) + bir (один раз) + kes (отрежь).",
      },
      {
        front: "Гора с горой не сходится, а человек с человеком сойдётся",
        back: "Tog' bilan tog' uchrashmas, odam bilan odam uchrashar",
        rule_description: "О неизбежности встреч и важности добрых отношений между людьми.",
      },
      {
        front: "Терпение — золото (на дне терпения — жёлтое золото)",
        back: "Sabr tagi — sariq oltin",
        rule_description: "Знаменитая узбекская пословица о выдержке: тот, кто умеет терпеть, добьётся лучшего результата.",
      },
      {
        front: "Ласковое слово и змею из норы выманит",
        back: "Shirin so'z ilonni inidan chiqaradi",
        rule_description: "Shirin so'z (сладкое/доброе слово) + ilonni (змею) + inidan (из её норы) + chiqaradi (выводит).",
      },
      {
        front: "Друг познаётся в беде",
        back: "Do'st boshga ish tushganda bilinadi (Do'st g'amda bilinadi)",
        rule_description: "Буквально: «Друг познаётся, когда на голову выпадает испытание (в горе)».",
      },
      {
        front: "Где течёт вода, там и трава растёт",
        back: "Suv oqqan joyda o't o'sar",
        rule_description: "О том, что жизнь и достаток приходят туда, где созданы условия и приложен труд.",
      },
      {
        front: "Настоящий друг дороже золота",
        back: "Chin do'st oltindan qimmat",
        rule_description: "Chin (истинный, настоящий) + do'st (друг) + oltindan (чем золото) + qimmat (дороже).",
      },
      {
        front: "Поспешишь — людей насмешишь",
        back: "Shoshilgan ishda xato ko'p",
        rule_description: "Буквально: «В поспешном деле много ошибок».",
      },
    ],
  },
];
