import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";
import {
  addTester,
  getTelegramIdByUserId,
  isDevEnvironment,
  isDevOrTester,
  isDevTelegramId,
  listTesters,
  removeTester,
} from "@/lib/data/dev-testers";

export const dynamic = "force-dynamic";

/**
 * GET /api/dev/testers
 * Returns the caller's access level for the testing panel.
 * The developer also receives the full tester list.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const telegramId = await getTelegramIdByUserId(userId);
    const isDev = isDevTelegramId(telegramId) || isDevEnvironment();
    const isTester = !isDev && (await isDevOrTester(telegramId));

    return NextResponse.json({
      success: true,
      is_dev: isDev,
      is_tester: isTester,
      testers: isDev ? await listTesters() : [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load testers";
    console.error("GET /api/dev/testers error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/dev/testers — adds a tester by Telegram ID (developer only).
 * Body: { telegram_id: string | number }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const telegramId = await getTelegramIdByUserId(userId);
    if (!isDevTelegramId(telegramId) && !isDevEnvironment()) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const targetId = String(body?.telegram_id ?? "").trim();
    const ok = await addTester(targetId);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Некорректный Telegram ID (или это ID разработчика)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, testers: await listTesters() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add tester";
    console.error("POST /api/dev/testers error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/dev/testers — removes a tester by Telegram ID (developer only).
 * Body: { telegram_id: string | number }
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const telegramId = await getTelegramIdByUserId(userId);
    if (!isDevTelegramId(telegramId) && !isDevEnvironment()) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    await removeTester(String(body?.telegram_id ?? ""));

    return NextResponse.json({ success: true, testers: await listTesters() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove tester";
    console.error("DELETE /api/dev/testers error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
