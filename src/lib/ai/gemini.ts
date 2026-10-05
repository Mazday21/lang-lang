import { GoogleGenAI } from "@google/genai";

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

/**
 * Returns an instance of GoogleGenAI if GEMINI_API_KEY is configured.
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Robust JSON cleaner and parser for Gemini output
 */
export function cleanAndParseGeminiJSON<T>(raw: string): T | null {
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

    return JSON.parse(text) as T;
  } catch (err) {
    console.warn("Failed to parse Gemini JSON:", raw, err);
    return null;
  }
}

/**
 * Generates structured JSON from Gemini with fallback to direct HTTP API
 */
export async function callGeminiJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model = DEFAULT_GEMINI_MODEL
): Promise<T | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // 1. Try official SDK
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (text) {
      return cleanAndParseGeminiJSON<T>(text);
    }
  } catch (sdkErr) {
    console.warn("Gemini SDK JSON call failed, trying direct HTTP fetch:", sdkErr);
  }

  // 2. Fallback to direct HTTP fetch
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Direct Gemini HTTP API error:", res.status, errText);
      return null;
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      return cleanAndParseGeminiJSON<T>(candidateText);
    }
  } catch (httpErr) {
    console.error("Direct Gemini HTTP call failed:", httpErr);
  }

  return null;
}

/**
 * Transcribes audio via Gemini using inlineData (base64)
 */
export async function callGeminiAudioTranscription(
  systemPrompt: string,
  audioBase64: string,
  mimeType: string,
  contextPrompt = "",
  model = DEFAULT_GEMINI_MODEL
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // 1. Try official SDK
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: contextPrompt
                ? `Ожидаемый контекст: "${contextPrompt}". Сделай точную транскрипцию аудио:`
                : "Сделай точную транскрипцию аудио:",
            },
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
      },
    });

    const text = response.text?.trim();
    if (text) {
      return text
        .replace(/^(транскрипция|transcription|текст):\s*/i, "")
        .replace(/^["'«»]|["'«»]$/g, "")
        .trim();
    }
  } catch (sdkErr) {
    console.warn("Gemini SDK audio transcription failed, trying direct HTTP fetch:", sdkErr);
  }

  // 2. Direct HTTP fetch fallback with inline_data
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: contextPrompt
                  ? `Ожидаемый контекст: "${contextPrompt}". Сделай точную транскрипцию аудио:`
                  : "Сделай точную транскрипцию аудио:",
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: audioBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Direct Gemini audio transcription error:", res.status, errText);
      return null;
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      return candidateText
        .replace(/^(транскрипция|transcription|текст):\s*/i, "")
        .replace(/^["'«»]|["'«»]$/g, "")
        .trim();
    }
  } catch (httpErr) {
    console.error("Direct Gemini audio transcription failed:", httpErr);
  }

  return null;
}
