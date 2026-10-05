export interface SeedCard {
  front: string;
  back: string;
  rule_description: string;
}

export interface SeedDeck {
  title: string;
  description: string;
  target_language: string;
  cards: SeedCard[];
}

export const SEED_DECKS: SeedDeck[] = [
  {
    title: "Узбекский: Настоящее время (Hozirgi zamon)",
    description: "Базовые аффиксы лица и числа глаголов: -yapman, -yapsan, -yapti...",
    target_language: "узбекский",
    cards: [
      {
        front: "Я иду (глагол: bor-)",
        back: "Men boryapman",
        rule_description: "Корень bor + аффикс настоящего времени -yap + личное окончание 1 л. ед.ч. -man",
      },
      {
        front: "Ты читаешь (глагол: o'qi-)",
        back: "Sen o'qiyapsan",
        rule_description: "Основа o'qi + аффикс времени -yap + личное окончание 2 л. ед.ч. -san",
      },
      {
        front: "Он / она пишет (глагол: yoz-)",
        back: "U yozyapti",
        rule_description: "Корень yoz + аффикс -yap + личное окончание 3 л. ед.ч. -ti",
      },
      {
        front: "Мы пьем чай (глагол: ich-)",
        back: "Biz choy ichyapmiz",
        rule_description: "Корень ich + аффикс -yap + личное окончание 1 л. мн.ч. -miz",
      },
      {
        front: "Они смотрят (глагол: qara-)",
        back: "Ular qarayaptilar",
        rule_description: "Основа qara + аффикс -yap + личное окончание 3 л. мн.ч. -tilar",
      },
    ],
  },
  {
    title: "Татарский: Притяжательные окончания",
    description: "Аффиксы принадлежности: -ым/-ем, -ың/-ең, -ы/-е...",
    target_language: "татарский",
    cards: [
      {
        front: "Моя книга (существительное: китап)",
        back: "Минем китабым",
        rule_description: "Твердая основа китап: глухой п переходит в звонкий б + окончание 1 л. ед.ч. -ым",
      },
      {
        front: "Твоя мама (существительное: әни)",
        back: "Синең әниең",
        rule_description: "Мягкая основа әни заканчивается на гласную, присоединяется аффикс 2 л. ед.ч. -ң",
      },
      {
        front: "Наш дом (существительное: йорт)",
        back: "Безнең йортыбыз",
        rule_description: "Твердая основа йорт + притяжательный аффикс 1 л. мн.ч. -ыбыз",
      },
      {
        front: "Его / её ручка (существительное: каләм)",
        back: "Аның каләме",
        rule_description: "Мягкая основа каләм + притяжательный аффикс 3 л. ед.ч. -е",
      },
      {
        front: "Ваш город (существительное: шәһәр)",
        back: "Сезнең шәһәрегез",
        rule_description: "Мягкая основа шәһәр + притяжательный аффикс 2 л. мн.ч. -егез",
      },
    ],
  },
];
