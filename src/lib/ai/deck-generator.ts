export interface GeneratedCard {
  front: string;
  back: string;
  rule_description: string;
}

export interface GeneratedDeckResult {
  deck_name: string;
  description: string;
  cards: GeneratedCard[];
}

function cleanAndParseDeckJSON(raw: string): GeneratedDeckResult | null {
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
      typeof parsed.deck_name === "string" &&
      typeof parsed.description === "string" &&
      Array.isArray(parsed.cards) &&
      parsed.cards.length > 0
    ) {
      const validCards: GeneratedCard[] = parsed.cards
        .filter(
          (c: unknown) =>
            c &&
            typeof c === "object" &&
            "front" in c &&
            "back" in c &&
            typeof (c as Record<string, unknown>).front === "string" &&
            typeof (c as Record<string, unknown>).back === "string"
        )
        .map((c: Record<string, unknown>) => ({
          front: String(c.front).trim(),
          back: String(c.back).trim(),
          rule_description: typeof c.rule_description === "string" ? c.rule_description.trim() : "",
        }));

      if (validCards.length > 0) {
        return {
          deck_name: parsed.deck_name.trim(),
          description: parsed.description.trim(),
          cards: validCards,
        };
      }
    }

    return null;
  } catch (err) {
    console.warn("Failed to parse generated deck JSON:", raw, err);
    return null;
  }
}

/**
 * Fallback generator when OpenRouter API is unavailable or returns an error.
 */
function fallbackGenerateDeck(topic: string): GeneratedDeckResult {
  const cleanTopic = topic.trim();

  return {
    deck_name: cleanTopic.length > 30 ? cleanTopic.slice(0, 30) + "..." : cleanTopic,
    description: `Обучающая колода по теме: ${cleanTopic}`,
    cards: [
      {
        front: "Сколько это стоит? (Узбекский: базар)",
        back: "Bu qancha turadi?",
        rule_description: "Bu (это) + qancha (сколько) + tur- (стоить, корень) + -adi (наст.-будущее время, 3 л.)",
      },
      {
        front: "Сделайте скидку, пожалуйста",
        back: "Iltimos, arzonroq qilib bering",
        rule_description: "Iltimos (пожалуйста) + arzon (дешевый) + -roq (сравн. степень) + qilib bering (сделайте/дайте)",
      },
      {
        front: "Взвесьте один килограмм",
        back: "Bir kilo tortib bering",
        rule_description: "Bir (один) + kilo + tort- (взвешивать) + -ib bering (деепричастие с вспомогательным глаголом)",
      },
      {
        front: "Очень вкусно и свежо",
        back: "Juda shirin va yangi",
        rule_description: "Juda (очень) + shirin (сладкий/вкусный) + va (и) + yangi (свежий/новый)",
      },
      {
        front: "Большое спасибо, до свидания",
        back: "Katta rahmat, xayr",
        rule_description: "Katta (большое) + rahmat (спасибо) + xayr (до свидания)",
      },
    ],
  };
}

/**
 * Generates an educational language deck using OpenRouter LLM.
 */
export async function generateDeckWithAI(topic: string): Promise<GeneratedDeckResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is not set. Using fallback deck generator.");
    return fallbackGenerateDeck(topic);
  }

  const systemPrompt = `Ты — эксперт-лингвист и преподаватель языков (с фокусом на узбекский, татарский, русский и другие языки).
Твоя задача — составить практическую обучающую колоду карточек для интервального повторения по теме, заданной пользователем.
Если в теме явно не указан язык, составь колоду для изучения узбекского языка (с переводом и пояснениями на русском).

ТРЕБОВАНИЯ:
1. Сгенерируй 5-7 полезных карточек по заданной теме.
2. front: Задание или русская фраза с указанием контекста/слова.
3. back: Естественная фраза или форма на изучаемом языке.
4. rule_description: Краткое грамматическое пояснение аффиксов, корней и правил согласования (1-2 предложения).

ОТВЕТ ВЫДАВАЙ СТРОГО В ВИДЕ ЧИСТОГО JSON БЕЗ MARKDOWN:
{
  "deck_name": "Короткое название темы (до 40 символов)",
  "description": "Краткое описание того, чему научит эта колода",
  "cards": [
    {
      "front": "Сколько стоит этот арбуз?",
      "back": "Bu tarvuz qancha turadi?",
      "rule_description": "Вопросительное местоимение qancha + глагол turmoq в настоящем времени (-adi)"
    }
  ]
}`;

  const userPrompt = `Тема для изучения: "${topic}"`;

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
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("OpenRouter deck generator returned HTTP error:", response.status);
      return fallbackGenerateDeck(topic);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return fallbackGenerateDeck(topic);
    }

    const parsed = cleanAndParseDeckJSON(content);
    return parsed || fallbackGenerateDeck(topic);
  } catch (err) {
    console.error("Error generating deck with AI:", err);
    return fallbackGenerateDeck(topic);
  }
}
