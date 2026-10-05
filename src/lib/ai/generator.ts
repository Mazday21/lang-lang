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
}

function cleanAndParseContextJSON(raw: string): DynamicContextResult | null {
  try {
    let text = raw.trim();

    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    }

    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(text);

    if (
      typeof parsed.sentence_with_blank === "string" &&
      typeof parsed.translation === "string" &&
      typeof parsed.expected_answer === "string"
    ) {
      return {
        sentence_with_blank: parsed.sentence_with_blank.trim(),
        translation: parsed.translation.trim(),
        expected_answer: parsed.expected_answer.trim(),
      };
    }

    return null;
  } catch (err) {
    console.warn("Failed to parse dynamic context JSON:", raw, err);
    return null;
  }
}

/**
 * Fallback generator when OpenRouter API is unavailable
 */
function fallbackGenerateContext(params: GenerateContextParams): DynamicContextResult {
  // Try to create a natural blank from back
  const words = params.back.trim().split(/\s+/);
  if (words.length > 1) {
    // Replace the last word (usually the inflected verb or noun in Uzbek/Tatar) with ___
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
 * Generates dynamic context for a card using OpenRouter LLM.
 */
export async function generateCardContext(
  params: GenerateContextParams
): Promise<DynamicContextResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set. Using fallback dynamic generator.");
    return fallbackGenerateContext(params);
  }

  const systemPrompt = `Ты — профессиональный лингвист и репетитор языков (узбекский, татарский и др.).
Твоя задача — сгенерировать короткое, живое и понятное предложение для тренировки грамматического правила в формате Cloze-теста (с пропуском).

ПРАВИЛА ГЕНЕРАЦИИ:
1. Придумай простое, естественное предложение на изучаемом языке, в котором используется целевое слово или грамматическая форма.
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
    topic_deck: params.deck_title || "Языковой тренажер",
    base_example_front: params.front,
    base_example_back: params.back,
    grammar_rule: params.rule_description || null,
  });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://lang-lang.telegram",
        "X-Title": "Language AI Trainer",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7, // Some creativity for varied examples
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("OpenRouter context generator HTTP error:", response.status);
      return fallbackGenerateContext(params);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return fallbackGenerateContext(params);
    }

    const parsed = cleanAndParseContextJSON(content);
    return parsed || fallbackGenerateContext(params);
  } catch (err) {
    console.error("Context generator error:", err);
    return fallbackGenerateContext(params);
  }
}
