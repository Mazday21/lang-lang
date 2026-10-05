import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { getUserLanguages, updateUserLanguages } from "@/lib/data/decks";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const langs = await getUserLanguages(userId);
    return NextResponse.json({
      success: true,
      native_language: langs.native_language,
      target_language: langs.target_language,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch languages";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const nativeLang = (body.native_language || "").toLowerCase().trim();
    const targetLang = (body.target_language || "").toLowerCase().trim();

    if (!nativeLang || !targetLang) {
      return NextResponse.json(
        { success: false, error: "Оба языка (native_language и target_language) обязательны" },
        { status: 400 }
      );
    }

    const updated = await updateUserLanguages(userId, nativeLang, targetLang);

    return NextResponse.json({
      success: true,
      native_language: updated.native_language,
      target_language: updated.target_language,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update languages";
    console.error("POST /api/user/languages error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
