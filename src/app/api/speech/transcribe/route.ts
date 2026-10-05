import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const prompt = (formData.get("prompt") as string) || "";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Аудиофайл не передан" },
        { status: 400 }
      );
    }

    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!groqKey && !openaiKey) {
      // In dev mode when keys are not configured yet
      console.warn("Neither GROQ_API_KEY nor OPENAI_API_KEY is configured. Returning mock transcription.");
      return NextResponse.json({
        success: true,
        text: prompt ? prompt.split(" ")[0] : "Men boryapman",
        isMock: true,
      });
    }

    const apiUrl = groqKey
      ? "https://api.groq.com/openai/v1/audio/transcriptions"
      : "https://api.openai.com/v1/audio/transcriptions";

    const apiKey = groqKey || openaiKey;
    const model = groqKey ? "whisper-large-v3-turbo" : "whisper-1";

    const apiFormData = new FormData();
    apiFormData.append("file", file, "audio.webm");
    apiFormData.append("model", model);
    apiFormData.append("response_format", "json");

    if (prompt) {
      // Contextual prompt to prevent Whisper from chopping affixes
      apiFormData.append("prompt", prompt);
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("STT API Error:", response.status, errText);
      return NextResponse.json(
        { success: false, error: `STT Error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      text: (result.text || "").trim(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Ошибка распознавания речи";
    console.error("Transcribe API error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
