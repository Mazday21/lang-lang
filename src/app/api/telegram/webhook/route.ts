import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/webhook — Telegram Bot API updates.
 * Payments are gone: the webhook just acknowledges updates so a registered
 * hook keeps working without errors.
 *
 * Registered via setWebhook with `secret_token`; authenticity is verified by
 * the X-Telegram-Bot-Api-Secret-Token header.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
      return new NextResponse("forbidden", { status: 403 });
    }

    await req.json().catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** Simple health check for webhook setup verification. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "telegram-webhook" });
}
