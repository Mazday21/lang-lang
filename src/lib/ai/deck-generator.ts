import { detectLanguageFromText } from "@/lib/utils/language";
import { callGeminiJSON } from "@/lib/ai/gemini";
import { callOpenRouterJSON, isOpenRouterConfigured } from "@/lib/ai/openrouter";

export interface GeneratedCard {
  front: string;
  back: string;
  rule_description: string;
}

export interface GeneratedDeckResult {
  deck_name: string;
  description: string;
  target_language?: string;
  level?: number;
  cards: GeneratedCard[];
}

/**
 * Fallback generator when Gemini API is unavailable or returns an error.
 */
function fallbackGenerateDeck(topic: string): GeneratedDeckResult {
  const cleanTopic = topic.trim();
  const detectedLang = detectLanguageFromText(cleanTopic);

  return {
    deck_name: cleanTopic.length > 30 ? cleanTopic.slice(0, 30) + "..." : cleanTopic,
    description: `Обучающая колода по теме: ${cleanTopic}`,
    target_language: detectedLang,
    cards: [
      {
        front: "Сколько это стоит? (Узбекский: базар)",
        back: "Bu qancha turadi?",
        rule_description: "Bu (это) + qancha (сколько) + tur- (стоить, корень) + -adi (наст.-будущее время, 3 л.)",
      },
      {
        front: "Сделайте скидку, пожалуйста",
        back: "Iltimos, arzonroq qilib bering",
        rule_description: "Iltimos (пожалуйста) + arzon (дешевый) + -roq (сравн. степень) + qilib bering (сделайте/дайте)",
      },
      {
        front: "Взвесьте один килограмм",
        back: "Bir kilo tortib bering",
        rule_description: "Bir (один) + kilo + tort- (взвешивать) + -ib bering (деепричастие с вспомогательным глаголом)",
      },
      {
        front: "Очень вкусно и свежо",
        back: "Juda shirin va yangi",
        rule_description: "Juda (очень) + shirin (сладкий/вкусный) + va (и) + yangi (свежий/новый)",
      },
      {
        front: "Большое спасибо, до свидания",
        back: "Katta rahmat, xayr",
        rule_description: "Katta (большое) + rahmat (спасибо) + xayr (до свидания)",
      },
    ],
  };
}

/**
/**
 * Generates an educational language deck.
 * Provider order: OpenRouter (MiMo, cheap) → Gemini → local fallback generator.
 */
export async function generateDeckWithAI(topic: string): Promise<GeneratedDeckResult> {
  const detectedLanguage = detectLanguageFromText(topic);

  const systemPrompt = `Ты — эксперт-лингвист и преподаватель языков (с фокусом на узбекский, татарский, английский, русский и другие языки).
Твоя задача — составить практическую обучающую колоду карточек для интервального повторения по теме, заданной пользователем.
Если в теме явно не указан язык, ориентируйся на: "${detectedLanguage}".

ТРЕБОВАНИЯ:
1. Сгенерируй 5-7 полезных карточек по заданной теме.
2. front: Задание или русская фраза с указанием контекста/слова.
3. back: Естественная фраза или форма на изучаемом языке.
4. rule_description: Краткое грамматическое пояснение аффиксов, корней и правил согласования (1-2 предложения).
5. target_language: Название изучаемого языка (например, "узбекский", "английский", "татарский").

ОТВЕТ ВЫДАВАЙ СТРОГО В ВИДЕ ЧИСТОГО JSON БЕЗ MARKDOWN:
{
  "deck_name": "Короткое название темы (до 40 символов)",
  "description": "Краткое описание того, чему научит эта колода",
  "target_language": "${detectedLanguage}",
  "cards": [
    {
      "front": "Сколько стоит этот арбуз?",
      "back": "Bu tarvuz qancha turadi?",
      "rule_description": "Вопросительное местоимение qancha + глагол turmoq в настоящем времени (-adi)"
    }
  ]
}`;

  const userPrompt = `Тема для изучения: "${topic}"`;

  const validate = (result: GeneratedDeckResult | null): GeneratedDeckResult | null => {
    if (
      result &&
      typeof result.deck_name === "string" &&
      typeof result.description === "string" &&
      Array.isArray(result.cards) &&
      result.cards.length > 0
    ) {
      return {
        deck_name: result.deck_name.trim(),
        description: result.description.trim(),
        target_language: result.target_language || detectedLanguage,
        cards: result.cards.map((c) => ({
          front: String(c.front).trim(),
          back: String(c.back).trim(),
          rule_description: typeof c.rule_description === "string" ? c.rule_description.trim() : "",
        })),
      };
    }
    return null;
  };

  // 1. OpenRouter (MiMo) — primary provider: cheap and reliable JSON output
  if (isOpenRouterConfigured()) {
    try {
      const result = await callOpenRouterJSON<GeneratedDeckResult>(systemPrompt, userPrompt, {
        temperature: 0.5,
        maxTokens: 8192,
      });
      const valid = validate(result);
      if (valid) return valid;
    } catch (err) {
      console.warn("OpenRouter deck generation failed:", err);
    }
  }

  // 2. Gemini — fallback provider
  if (process.env.GEMINI_API_KEY) {
    try {
      const result = await callGeminiJSON<GeneratedDeckResult>(systemPrompt, userPrompt);
      const valid = validate(result);
      if (valid) return valid;
    } catch (err) {
      console.warn("Gemini deck generation failed:", err);
    }
  }

  // 3. Local fallback generator (works offline, no AI)
  return fallbackGenerateDeck(topic);
}
