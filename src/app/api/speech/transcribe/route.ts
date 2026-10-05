import { NextRequest, NextResponse } from "next/server";
import { languageToIsoCode } from "@/lib/utils/language";

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

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Required exact dynamic system prompt
    const systemPrompt = `Ты получаешь голосовое сообщение от пользователя, изучающего язык: ${targetLanguage}. Сделай точную транскрипцию сказанного именно на этом языке и верни только текст без лишних комментариев и перевода.`;

    // 1. Try multimodal transcription via OpenRouter if key is present
    if (openRouterKey) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = file.type || "audio/webm";
        const format = mimeType.includes("mp4")
          ? "mp4"
          : mimeType.includes("mp3")
          ? "mp3"
          : mimeType.includes("wav")
          ? "wav"
          : "webm";

        const model =
          process.env.OPENROUTER_AUDIO_MODEL ||
          process.env.OPENROUTER_MODEL ||
          "google/gemini-2.5-flash";

        // Try standard OpenAI audio format on OpenRouter
        const openRouterResponse = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterKey}`,
              "HTTP-Referer": "https://lang-lang.telegram",
              "X-Title": "Language AI Trainer",
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: prompt
                        ? `Контекст фразы: "${prompt}". Сделай точную транскрипцию аудио:`
                        : "Сделай точную транскрипцию аудиозаписи:",
                    },
                    {
                      type: "input_audio",
                      input_audio: {
                        data: base64Audio,
                        format,
                      },
                    },
                  ],
                },
              ],
              temperature: 0.1,
            }),
          }
        );

        if (openRouterResponse.ok) {
          const data = await openRouterResponse.json();
          let transcription = (data.choices?.[0]?.message?.content || "").trim();

          // Clean up any extra prefixes
          transcription = transcription
            .replace(/^(транскрипция|transcription|текст):\s*/i, "")
            .replace(/^["'«»]|["'«»]$/g, "")
            .trim();

          if (transcription) {
            return NextResponse.json({
              success: true,
              text: transcription,
              provider: "openrouter",
              targetLanguage,
            });
          }
        } else {
          // If input_audio failed, try data URL format for Google models
          const dataUrlResponse = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openRouterKey}`,
                "HTTP-Referer": "https://lang-lang.telegram",
                "X-Title": "Language AI Trainer",
              },
              body: JSON.stringify({
                model,
                messages: [
                  {
                    role: "system",
                    content: systemPrompt,
                  },
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: "Сделай точную транскрипцию аудиозаписи без комментариев:",
                      },
                      {
                        type: "image_url",
                        image_url: {
                          url: `data:${mimeType};base64,${base64Audio}`,
                        },
                      },
                    ],
                  },
                ],
                temperature: 0.1,
              }),
            }
          );

          if (dataUrlResponse.ok) {
            const data = await dataUrlResponse.json();
            let transcription = (data.choices?.[0]?.message?.content || "").trim();
            transcription = transcription
              .replace(/^(транскрипция|transcription|текст):\s*/i, "")
              .replace(/^["'«»]|["'«»]$/g, "")
              .trim();

            if (transcription) {
              return NextResponse.json({
                success: true,
                text: transcription,
                provider: "openrouter-dataurl",
                targetLanguage,
              });
            }
          }
        }
      } catch (orErr) {
        console.warn("OpenRouter multimodal transcription error, falling back to Whisper:", orErr);
      }
    }

    // 2. Fallback to Groq Whisper or OpenAI Whisper
    if (groqKey || openaiKey) {
      const apiUrl = groqKey
        ? "https://api.groq.com/openai/v1/audio/transcriptions"
        : "https://api.openai.com/v1/audio/transcriptions";

      const apiKey = groqKey || openaiKey;
      const model = groqKey ? "whisper-large-v3-turbo" : "whisper-1";

      const apiFormData = new FormData();
      apiFormData.append("file", file, "audio.webm");
      apiFormData.append("model", model);
      apiFormData.append("response_format", "json");

      // Pass target language ISO code to Whisper
      const isoCode = languageToIsoCode(targetLanguage);
      if (isoCode) {
        apiFormData.append("language", isoCode);
      }

      // Contextual prompt guiding Whisper
      const contextualPrompt = prompt
        ? `${prompt}. Язык: ${targetLanguage}`
        : `Язык: ${targetLanguage}`;
      apiFormData.append("prompt", contextualPrompt);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: apiFormData,
      });

      if (response.ok) {
        const result = await response.json();
        return NextResponse.json({
          success: true,
          text: (result.text || "").trim(),
          provider: "whisper",
          targetLanguage,
        });
      }
    }

    // 3. Dev / Mock fallback when no API keys are provided
    console.warn("No STT keys available. Returning mock transcription for:", targetLanguage);
    const mockResponses: Record<string, string> = {
      узбекский: "Men boryapman",
      татарский: "Минем китабым",
      английский: "I am going",
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
