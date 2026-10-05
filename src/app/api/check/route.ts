import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { checkAnswerWithAI } from "@/lib/ai/checker";
import { checkAndConsumeAILimit } from "@/lib/limits";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check & consume unit economics limit
    const limitCheck = await checkAndConsumeAILimit(userId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          limit_exceeded: true,
          error: limitCheck.error || "Дневной лимит AI-проверок исчерпан",
          limits: limitCheck,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { front, back, rule_description, user_input, is_voice, target_language } = body;

    if (!user_input || typeof user_input !== "string" || !user_input.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Ответ не может быть пустым",
        },
        { status: 400 }
      );
    }

    if (!front || !back) {
      return NextResponse.json(
        {
          success: false,
          error: "Параметры карточки (front, back) обязательны",
        },
        { status: 400 }
      );
    }

    const checkResult = await checkAnswerWithAI({
      front,
      back,
      rule_description,
      user_input: user_input.trim(),
      is_voice: Boolean(is_voice),
      target_language,
    });

    return NextResponse.json({
      success: true,
      result: checkResult,
      limits: limitCheck,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Ошибка проверки ответа";
    console.error("POST /api/check error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
