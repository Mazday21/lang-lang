import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { updateCardReview } from "@/lib/data/decks";
import { SM2Grade } from "@/lib/sm2";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const grade = Number(body.grade) as SM2Grade;

    if (![1, 2, 3, 4].includes(grade)) {
      return NextResponse.json(
        { success: false, error: "Invalid grade. Must be 1, 2, 3, or 4" },
        { status: 400 }
      );
    }

    const result = await updateCardReview(userId, cardId, grade);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to review card";
    console.error("POST /api/cards/[cardId]/review error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
