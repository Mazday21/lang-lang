import { callGeminiJSON } from "@/lib/ai/gemini";

export interface AICheckResult {
  is_correct: boolean;
  explanation: string;
  highlight_error: string;
  stt_suspicious: boolean;
}

export interface CheckAnswerParams {
  front: string;
  back: string;
  rule_description?: string | null;
  user_input: string;
  is_voice?: boolean;
  target_language?: string;
}

/**
 * Fallback heuristic checker when Gemini API key is missing or call fails.
 */
function fallbackCheck(params: CheckAnswerParams): AICheckResult {
  const cleanInput = params.user_input.trim().toLowerCase().replace(/[.,!?'"«»]/g, "");
  const cleanBack = params.back.trim().toLowerCase().replace(/[.,!?'"«»]/g, "");

  const isExact = cleanInput === cleanBack;

  if (isExact) {
    return {
      is_correct: true,
      explanation: "Отлично! Ответ абсолютно верный.",
      highlight_error: "",
      stt_suspicious: false,
    };
  }

  // Heuristic: check if voice input seems cut off
  const isCutOffVoice = Boolean(params.is_voice && cleanInput.length < 4 && cleanBack.length > 5);

  return {
    is_correct: false,
    explanation: params.rule_description
      ? `Правильный ответ: "${params.back}". Правило: ${params.rule_description}`
      : `Правильный ответ: "${params.back}".`,
    highlight_error: cleanInput,
    stt_suspicious: isCutOffVoice,
  };
}

/**
 * Checks user answer using Google Gemini API (gemini-2.5-flash-lite).
 */
export async function checkAnswerWithAI(params: CheckAnswerParams): Promise<AICheckResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using local fallback checker.");
    return fallbackCheck(params);
  }

  const targetLang = params.target_language || "узбекский";
  const systemPrompt = `Ты — добрый, спокойный личный репетитор языков (изучаемый язык: ${targetLang}).
Твоя задача — объективно проверить ответ ученика на грамматическую и смысловую корректность на языке: ${targetLang}.
Твой тон — спокойный, поддерживающий, без агрессии и без критики.

ОСОБЕННОСТИ ПРОВЕРКИ:
1. Проверяй соответствие корня слова, аффиксов времени, лица, числа, притяжательности и гармонии гласных.
2. Незначительные опечатки в 1 букву, не меняющие морфему или смысл, можно простить или мягко отметить.
3. ОШИБКИ МИКРОФОНА (stt_suspicious):
   Если ученик отвечал голосом (is_voice=true) или ответ выглядит как типичная ослышка распознавания речи (например, вместо целевого аффикса распозналось созвучное слово другого языка, проглочено окончание или фоновый шум), ОБЯЗАТЕЛЬНО установи: "stt_suspicious": true.
   Если это обычная грамматическая ошибка ученика: "stt_suspicious": false.

ОТВЕТ ВЫДАВАЙ СТРОГО В ВИДЕ ЧИСТОГО JSON БЕЗ КАКИХ-ЛИБО ДРУГИХ СИМВОЛОВ И БЕЗ MARKDOWN:
{
  "is_correct": boolean,
  "explanation": "Краткое (1-2 предложения) пояснение на русском языке",
  "highlight_error": "Конкретная часть слова или аффикс с ошибкой (пустая строка, если верно)",
  "stt_suspicious": boolean
}`;

  const userPrompt = JSON.stringify({
    target_language: targetLang,
    task: params.front,
    expected_answer: params.back,
    rule_context: params.rule_description || null,
    user_answer: params.user_input,
    is_voice_input: Boolean(params.is_voice),
  });

  try {
    const result = await callGeminiJSON<AICheckResult>(systemPrompt, userPrompt);
    if (!result) {
      return fallbackCheck(params);
    }

    return {
      is_correct: Boolean(result.is_correct),
      explanation: typeof result.explanation === "string" ? result.explanation : "",
      highlight_error: typeof result.highlight_error === "string" ? result.highlight_error : "",
      stt_suspicious: Boolean(result.stt_suspicious),
    };
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return fallbackCheck(params);
  }
}
