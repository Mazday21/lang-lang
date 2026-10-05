import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { getUserLimits, resetUserLimits, setUserPlan } from "@/lib/limits";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const limits = await getUserLimits(userId);
    return NextResponse.json({ success: true, ...limits });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get user limits";
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
    const { action, plan } = body;

    if (action === "reset") {
      await resetUserLimits(userId);
    } else if (action === "set_plan" && (plan === "free" || plan === "pro")) {
      await setUserPlan(userId, plan);
    }

    const updatedLimits = await getUserLimits(userId);
    return NextResponse.json({ success: true, ...updatedLimits });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update user limits";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
