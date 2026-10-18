import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { getUserProgress } from "@/lib/data/user-progress";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/progress
 * Study statistics: reviewed today, mastered cards, today's queue status.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const progress = await getUserProgress(userId);
    return NextResponse.json({ success: true, ...progress });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load progress";
    console.error("GET /api/user/progress error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
