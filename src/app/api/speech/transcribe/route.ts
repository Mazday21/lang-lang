import { NextRequest, NextResponse } from "next/server";
import { callGeminiAudioTranscription } from "@/lib/ai/gemini";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { checkAndConsumeVoiceLimit } from "@/lib/limits";
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

    // AI voice checks quota (daily limit + free trial) — consumed before STT
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const voiceCheck = await checkAndConsumeVoiceLimit(userId);
    if (!voiceCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          limit_exceeded: true,
          reason: voiceCheck.reason || "daily",
          error: voiceCheck.error || "Лимит голосовых проверок исчерпан",
          limits: voiceCheck,
        },
        { status: 403 }
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

    // No STT provider available → the client shows a localized
    // «Извините, сервис временно недоступен» message
    return NextResponse.json(
      {
        success: false,
        service_unavailable: true,
        error: "Speech recognition service is temporarily unavailable",
      },
      { status: 503 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Ошибка распознавания речи";
    console.error("Transcribe API error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
