import { cleanAndParseGeminiJSON } from "@/lib/ai/gemini";

/**
 * OpenRouter client for automatic content generation (curriculum, decks, cards).
 * Recommended model: xiaomi/mimo-v2.6-flash — $0.14/$0.28 per 1M tokens,
 * 1M context, structured JSON output support. Ideal for bulk flashcard generation.
 * Override with OPENROUTER_MODEL env var (e.g. xiaomi/mimo-v2.6-flash:free, xiaomi/mimo-v2.6-pro).
 */
export const DEFAULT_OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "xiaomi/mimo-v2.6-flash";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Returns true when OPENROUTER_API_KEY is configured.
 */
export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

/**
 * Calls OpenRouter chat completions with JSON response mode and parses the result.
 * Returns null on any failure (network, auth, invalid JSON) — callers decide fallbacks.
 */
export async function callOpenRouterJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  options: OpenRouterOptions = {}
): Promise<T | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model = options.model || DEFAULT_OPENROUTER_MODEL;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "https://github.com/Mazday21/lang-lang",
        "X-Title": "LangLang Trainer",
      },
      body: JSON.stringify({
        model,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenRouter API error:", res.status, errText);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error("OpenRouter returned empty content:", JSON.stringify(data)?.slice(0, 500));
      return null;
    }

    return cleanAndParseGeminiJSON<T>(content);
  } catch (err) {
    console.error("OpenRouter call failed:", err);
    return null;
  }
}
