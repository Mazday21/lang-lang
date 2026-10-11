import { NextRequest, NextResponse } from "next/server";
import { recordStarPayment, activatePro } from "@/lib/data/payments";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/webhook — Telegram Bot API payment events.
 *
 * 1. `pre_checkout_query` — MUST be answered within 10 seconds or the payment
 *    is cancelled automatically.
 * 2. `message.successful_payment` — Stars are charged: activate Pro for 30 days
 *    (idempotent via the payment charge id) and thank the user.
 *
 * Registered via setWebhook with `secret_token`; authenticity is verified by
 * the X-Telegram-Bot-Api-Secret-Token header.
 */

async function tgCall(token: string, method: string, payload: unknown) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn(`Telegram ${method} failed:`, err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
      return new NextResponse("forbidden", { status: 403 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const update = await req.json();

    // 1. Pre-checkout confirmation (strict 10s deadline)
    const pcq = update.pre_checkout_query;
    if (pcq) {
      const payload = String(pcq.invoice_payload || "");
      const ok = Boolean(token) && payload.startsWith("pro:");
      if (token) {
        await tgCall(token, "answerPreCheckoutQuery", ok
          ? {
              pre_checkout_query_id: pcq.id,
              ok: true,
            }
          : {
              pre_checkout_query_id: pcq.id,
              ok: false,
              error_message: "Платёж недоступен. Попробуйте позже.",
            });
      }
      return NextResponse.json({ ok: true });
    }

    // 2. Successful Stars payment → activate Pro
    const sp = update.message?.successful_payment;
    if (sp) {
      const payload = String(sp.invoice_payload || "");
      const userId = payload.split(":")[1] || "";
      const stars = Number(sp.total_amount) || 0;
      const chargeId = String(sp.telegram_payment_charge_id || "");

      if (userId && sp.currency === "XTR") {
        // Idempotent: Telegram may redeliver the same update
        const isNew = await recordStarPayment({
          user_id: userId,
          charge_id: chargeId || `${userId}:${payload}`,
          stars,
          is_recurring: Boolean(sp.is_recurring),
        });
        if (isNew) {
          await activatePro(userId, 30);
        }
      }

      if (token && update.message?.chat?.id) {
        await tgCall(token, "sendMessage", {
          chat_id: update.message.chat.id,
          text: "🎉 Подписка Pro активна на 30 дней! Спасибо за поддержку — учите языки с удовольствием.",
        });
      }
    }

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