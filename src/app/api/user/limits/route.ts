import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import { getUserLimits, resetUserLimits, setUserPlan } from "@/lib/limits";
import { getTelegramIdByUserId, isDevOrTester } from "@/lib/data/dev-testers";

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

    // Dev/tester-only actions: nobody else can reset limits or flip their plan
    const telegramId = await getTelegramIdByUserId(userId);
    if (!(await isDevOrTester(telegramId))) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

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
