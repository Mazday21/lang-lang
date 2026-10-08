import { callOpenRouterJSON } from "@/lib/ai/openrouter";
import { GeneratedCard, GeneratedDeckResult } from "@/lib/ai/deck-generator";

/**
 * Curriculum generator: produces topic maps and flashcard decks for a language pair.
 * Used by the automatic content pipeline (auto-populate + daily cron refill).
 */

export interface CurriculumTopic {
  title: string;
  description: string;
  level: number;
}

export interface WeakCard {
  front: string;
  back: string;
  rule_description: string | null;
}

const LANG_NAMES: Record<string, string> = {
  ru: "русский",
  uz: "узбекский",
  en: "английский",
};

function langName(code: string): string {
  return LANG_NAMES[code.toLowerCase()] || code;
}

function levelLabel(level: number): string {
  switch (level) {
    case 1:
      return "новичок, базовые слова и фразы";
    case 2:
      return "базовый уровень, повседневное общение";
    case 3:
      return "средний уровень, свободные разговоры";
    case 4:
      return "продвинутый уровень, сложные конструкции";
    default:
      return "экспертный уровень, нюансы и идиомы";
  }
}

/**
 * Local fallback topics used when AI is unavailable.
 */
export const FALLBACK_TOPICS: CurriculumTopic[] = [
  {
    title: "Базовые фразы и приветствия",
    description: "Приветствия, знакомство и вежливые выражения",
    level: 1,
  },
  {
    title: "Числа, время и покупки",
    description: "Счет, цены, магазин и рынок",
    level: 1,
  },
  {
    title: "Еда и ресторан",
    description: "Заказ еды, меню и вкусовые предпочтения",
    level: 2,
  },
  {
    title: "Путешествия и транспорт",
    description: "Аэропорт, такси, отель и городская навигация",
    level: 2,
  },
  {
    title: "Работа и деловое общение",
    description: "Офис, встречи, переписка и презентации",
    level: 3,
  },
  {
    title: "Эмоции и общение по душам",
    description: "Чувства, мнения, поддержка и дружеская беседа",
    level: 3,
  },
];

/**
 * Validates and normalizes generated cards: drops empty/oversized entries,
 * deduplicates by normalized front, enforces the limit.
 */
export function validateGeneratedCards(raw: unknown, limit = 12): GeneratedCard[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const out: GeneratedCard[] = [];

  for (const c of raw) {
    const front = String((c as any)?.front ?? "").trim();
    const back = String((c as any)?.back ?? "").trim();
    const rule = String((c as any)?.rule_description ?? "").trim();

    if (!front || !back) continue;
    if (front.length > 200 || back.length > 200 || rule.length > 500) continue;

    const key = front.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ front, back, rule_description: rule });
    if (out.length >= limit) break;
  }

  return out;
}

function validateTopics(raw: unknown, limit = 6): CurriculumTopic[] {
  const arr = Array.isArray(raw) ? raw : (raw as any)?.topics;
  if (!Array.isArray(arr)) return [];

  const seen = new Set<string>();
  const out: CurriculumTopic[] = [];

  for (const t of arr) {
    const title = String((t as any)?.title ?? "").trim();
    const description = String((t as any)?.description ?? "").trim();
    const level = Math.min(5, Math.max(1, Math.round(Number((t as any)?.level) || 1)));

    if (!title || title.length > 120) continue;
    if (description.length > 300) continue;

    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ title, description, level });
    if (out.length >= limit) break;
  }

  return out;
}

/**
 * Generates a topic map (curriculum) for a language pair.
 * Falls back to local topics when AI is unavailable.
 */
export async function generateTopicsForPair(
  nativeLang: string,
  targetLang: string,
  count = 6
): Promise<CurriculumTopic[]> {
  const nativeName = langName(nativeLang);
  const targetName = langName(targetLang);

  const systemPrompt =
    "Ты — методист по преподаванию иностранных языков. Составляешь учебные программы для языковых приложений. Всегда отвечай строгим JSON без пояснений.";
  const userPrompt = `Носитель ${nativeName} языка изучает ${targetName} язык. Придумай ${count} тем для обучающих колод-флешек, от простого к сложному: уровни 1-3 (1 — новичок, 2 — базовый, 3 — средний). Темы практичные и разнообразные: быт, путешествия, еда, работа, общение, хобби. Названия тем и описания — на ${nativeName} языке. Строгий JSON: {"topics":[{"title":"...","description":"...","level":1}]}`;

  const result = await callOpenRouterJSON<{ topics?: unknown[] }>(systemPrompt, userPrompt, {
    temperature: 0.5,
  });

  const topics = validateTopics(result, count);
  return topics.length > 0 ? topics : FALLBACK_TOPICS.slice(0, count);
}

/**
 * Generates flashcards for one curriculum topic (level-aware).
 * Returns null on failure — caller skips and retries later.
 */
export async function generateDeckForTopic(
  topic: CurriculumTopic,
  nativeLang: string,
  targetLang: string
): Promise<GeneratedDeckResult | null> {
  const nativeName = langName(nativeLang);
  const targetName = langName(targetLang);

  const systemPrompt = `Ты — преподаватель ${targetName} языка. Создаёшь карточки-флешки для заучивания фраз. Всегда отвечай строгим JSON без пояснений.`;
  const userPrompt = `Носитель ${nativeName} языка изучает ${targetName} язык. Тема: "${topic.title}" (${topic.description}). Уровень ${topic.level}: ${levelLabel(topic.level)}.
Создай 10-12 карточек. Формат каждой карточки: front — фраза или вопрос на ${nativeName} языке; back — перевод на ${targetName} язык; rule_description — короткое правило или пояснение на ${nativeName} языке (грамматика, употребление, произношение). Полные практичные фразы важнее отдельных слов. Строгий JSON: {"cards":[{"front":"...","back":"...","rule_description":"..."}]}`;

  const result = await callOpenRouterJSON<{ cards?: unknown[] }>(systemPrompt, userPrompt, {
    temperature: 0.5,
    maxTokens: 4096,
  });

  const cards = validateGeneratedCards(result?.cards, 12);
  if (cards.length < 5) return null;

  return {
    deck_name: topic.title,
    description: topic.description,
    target_language: targetLang,
    level: topic.level,
    cards,
  };
}

/**
 * Generates a personal reinforcement deck targeting the user's weak cards.
 * Creates NEW cards in different contexts around the same vocabulary/grammar.
 */
export async function generateReinforcementDeck(
  weakCards: WeakCard[],
  nativeLang: string,
  targetLang: string,
  level = 1
): Promise<GeneratedDeckResult | null> {
  const nativeName = langName(nativeLang);
  const targetName = langName(targetLang);

  const weakList = weakCards
    .map((c, i) => `${i + 1}. "${c.front}" → "${c.back}"${c.rule_description ? ` (${c.rule_description})` : ""}`)
    .join("\n");

  const systemPrompt = `Ты — преподаватель ${targetName} языка. Создаёшь карточки-флешки для закрепления сложного материала. Всегда отвечай строгим JSON без пояснений.`;
  const userPrompt = `Ученик (${nativeName} → ${targetName}) регулярно ошибается в этих карточках:
${weakList}

Создай 8-10 НОВЫХ карточек для закрепления той же лексики и грамматики в других контекстах и ситуациях (не копируй исходные фразы). Формат: front — фраза на ${nativeName} языке; back — перевод на ${targetName} язык; rule_description — короткое пояснение на ${nativeName} языке. Строгий JSON: {"title":"Закрепление сложных карточек","description":"...","cards":[{"front":"...","back":"...","rule_description":"..."}]}`;

  const result = await callOpenRouterJSON<{
    title?: string;
    description?: string;
    cards?: unknown[];
  }>(systemPrompt, userPrompt, { temperature: 0.6, maxTokens: 4096 });

  const cards = validateGeneratedCards(result?.cards, 10);
  if (cards.length < 5) return null;

  return {
    deck_name: String(result?.title || "Закрепление сложных карточек").trim(),
    description: String(result?.description || "Карточки для закрепления сложного материала").trim(),
    target_language: targetLang,
    level,
    cards,
  };
}
