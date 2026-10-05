import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { generateCardContext } from "@/lib/ai/generator";
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
    const { front, back, rule_description, deck_title } = body;

    if (!front || !back) {
      return NextResponse.json(
        { success: false, error: "Missing front or back parameters" },
        { status: 400 }
      );
    }

    const result = await generateCardContext({
      front,
      back,
      rule_description,
      deck_title,
    });

    return NextResponse.json({
      success: true,
      result,
      limits: limitCheck,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate context";
    console.error("POST /api/generate-context error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
