import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { getUserDecks } from "@/lib/data/decks";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pair = searchParams.get("pair") || undefined;

    const decks = await getUserDecks(userId, pair);
    return NextResponse.json({ success: true, decks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load decks";
    console.error("GET /api/decks error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
