import { callGeminiJSON } from "@/lib/ai/gemini";

export interface DynamicContextResult {
  sentence_with_blank: string;
  translation: string;
  expected_answer: string;
}

export interface GenerateContextParams {
  front: string;
  back: string;
  rule_description?: string | null;
  deck_title?: string;
  target_language?: string;
}

/**
 * Fallback generator when Gemini API is unavailable
 */
function fallbackGenerateContext(params: GenerateContextParams): DynamicContextResult {
  const words = params.back.trim().split(/\s+/);
  if (words.length > 1) {
    const expected = words[words.length - 1];
    const sentenceWithBlank = words.slice(0, -1).join(" ") + " ___";
    return {
      sentence_with_blank: sentenceWithBlank,
      translation: params.front,
      expected_answer: expected,
    };
  }

  return {
    sentence_with_blank: "___",
    translation: params.front,
    expected_answer: params.back,
  };
}

/**
 * Generates dynamic context for a card using Google Gemini API (gemini-2.5-flash-lite).
 */
export async function generateCardContext(
  params: GenerateContextParams
): Promise<DynamicContextResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set. Using fallback dynamic generator.");
    return fallbackGenerateContext(params);
  }

  const targetLang = params.target_language || "узбекский";

  const systemPrompt = `Ты — профессиональный лингвист и репетитор языков (изучаемый язык: ${targetLang}).
Твоя задача — сгенерировать короткое, живое и понятное предложение для тренировки грамматического правила в формате Cloze-теста (с пропуском) на языке: ${targetLang}.

ПРАВИЛА ГЕНЕРАЦИИ:
1. Придумай простое, естественное предложение на изучаемом языке (${targetLang}), в котором используется целевое слово или грамматическая форма.
2. Замени целевое слово (или форму с суффиксом) на тройное подчеркивание "___".
3. Напиши полный перевод всего предложения на русский язык, чтобы ученик понимал смысл и контекст.
4. В поле expected_answer укажи точно то слово или форму, которая должна стоять вместо "___".
5. Предложение должно быть новым (не повторять в точности исходный пример), но строго соблюдать грамматическое правило!

ОТВЕТ ВЫДАВАЙ СТРОГО В ВИДЕ ЧИСТОГО JSON БЕЗ MARKDOWN:
{
  "sentence_with_blank": "Men bugun bozorga ___",
  "translation": "Я сегодня иду на базар",
  "expected_answer": "boryapman"
}`;

  const userPrompt = JSON.stringify({
    target_language: targetLang,
    topic_deck: params.deck_title || "Языковой тренажер",
    base_example_front: params.front,
    base_example_back: params.back,
    grammar_rule: params.rule_description || null,
  });

  try {
    const result = await callGeminiJSON<DynamicContextResult>(systemPrompt, userPrompt);
    if (
      result &&
      typeof result.sentence_with_blank === "string" &&
      typeof result.translation === "string" &&
      typeof result.expected_answer === "string"
    ) {
      return {
        sentence_with_blank: result.sentence_with_blank.trim(),
        translation: result.translation.trim(),
        expected_answer: result.expected_answer.trim(),
      };
    }
    return fallbackGenerateContext(params);
  } catch (err) {
    console.error("Context generator error:", err);
    return fallbackGenerateContext(params);
  }
}
