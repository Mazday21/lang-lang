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
 * Extracts and cleans JSON from LLM output.
 * Handles markdown formatting (```json ... ```) or accidental text surrounding the JSON.
 */
function cleanAndParseJSON(raw: string): AICheckResult | null {
  try {
    let text = raw.trim();

    // Strip markdown code fences if present
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    }

    // Locate the first { and the last }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(text);

    return {
      is_correct: Boolean(parsed.is_correct),
      explanation: typeof parsed.explanation === "string" ? parsed.explanation : "",
      highlight_error: typeof parsed.highlight_error === "string" ? parsed.highlight_error : "",
      stt_suspicious: Boolean(parsed.stt_suspicious),
    };
  } catch (err) {
    console.warn("Failed to parse LLM JSON:", raw, err);
    return null;
  }
}

/**
 * Fallback heuristic checker when OpenRouter API key is missing or calls fail.
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

  // Heuristic: check if voice input seems cut off (length diff > 4 and input is short)
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
 * Checks user answer using OpenRouter LLM.
 */
export async function checkAnswerWithAI(params: CheckAnswerParams): Promise<AICheckResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is not set. Using local fallback checker.");
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
   Если ученик отвечал голосом (is_voice=true) или ответ выглядит как типичная ослышка распознавания речи STT (например, вместо тюркского аффикса распозналось созвучное русское слово, проглочено окончание, паразитный звук или фоновый шум), ОБЯЗАТЕЛЬНО установи: "stt_suspicious": true.
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
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error:", response.status, errText);
      return fallbackCheck(params);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn("OpenRouter returned empty message content.");
      return fallbackCheck(params);
    }

    const parsed = cleanAndParseJSON(content);
    if (!parsed) {
      // Retry once if parse failed
      return fallbackCheck(params);
    }

    return parsed;
  } catch (error) {
    console.error("Error calling OpenRouter:", error);
    return fallbackCheck(params);
  }
}
