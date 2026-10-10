import { NextRequest, NextResponse } from "next/server";
import { callGeminiAudioTranscription } from "@/lib/ai/gemini";
import {
  callOpenRouterAudioTranscription,
  isOpenRouterConfigured,
  DEFAULT_OPENROUTER_STT_MODEL,
} from "@/lib/ai/openrouter";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const prompt = (formData.get("prompt") as string) || "";
    const targetLanguage =
      (formData.get("targetLanguage") as string) ||
      (formData.get("target_language") as string) ||
      "узбекский";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Аудиофайл не передан" },
        { status: 400 }
      );
    }

    // Required exact system prompt
    const systemPrompt = `Ты распознаешь речь пользователя, изучающего ${targetLanguage}. Верни только точный текст того, что было сказано, без перевода и пояснений.`;

    const arrayBuffer = await file.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "audio/webm";

    // 1. Cheap STT via OpenRouter (gemini-2.0-flash-lite by default)
    if (isOpenRouterConfigured()) {
      const text = await callOpenRouterAudioTranscription(
        systemPrompt,
        base64Audio,
        mimeType,
        prompt
      );

      if (text) {
        return NextResponse.json({
          success: true,
          text,
          provider: `openrouter:${DEFAULT_OPENROUTER_STT_MODEL}`,
          targetLanguage,
        });
      }
    }

    // 2. Fallback: Gemini direct API
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const text = await callGeminiAudioTranscription(
        systemPrompt,
        base64Audio,
        mimeType,
        prompt
      );

      if (text) {
        return NextResponse.json({
          success: true,
          text,
          provider: "gemini",
          targetLanguage,
        });
      }
    }

    // Dev / Mock fallback when GEMINI_API_KEY is not configured yet
    console.warn("GEMINI_API_KEY not configured. Returning fallback transcription for:", targetLanguage);
    const mockResponses: Record<string, string> = {
      узбекский: "Men boryapman",
      татарский: "Минем китабым",
      английский: "I am learning",
      русский: "Я иду",
      испанский: "Voy a ir",
    };

    return NextResponse.json({
      success: true,
      text: prompt ? prompt.split(" ")[0] : mockResponses[targetLanguage] || "Men boryapman",
      isMock: true,
      targetLanguage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Ошибка распознавания речи";
    console.error("Transcribe API error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
