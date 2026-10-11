import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";

export const dynamic = "force-dynamic";

/** Telegram Stars price of the Pro subscription (in Stars). */
const STARS_PRICE = 150;
/** Subscription duration in seconds (30 days) — enables auto-renewal in Telegram. */
const SUBSCRIPTION_PERIOD_SECONDS = 30 * 24 * 3600;

/**
 * POST /api/checkout — creates a Telegram Stars invoice.
 * The Mini App opens the returned `checkout_url` with `WebApp.openInvoice`.
 * Currency "XTR" = Telegram Stars; `amount` is the price in whole Stars.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const provider = body.provider || "stars"; // "stars" | "payme" | "platega"

    if (provider !== "stars") {
      // External gateways are not wired yet
      return NextResponse.json(
        { success: false, error: "Платёжный провайдер пока недоступен" },
        { status: 501 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "TELEGRAM_BOT_TOKEN не настроен" },
        { status: 500 }
      );
    }

    // payload returns in the webhook and identifies the buyer
    const payload = `pro:${userId}:${Date.now()}`;

    const createInvoice = (withSubscription: boolean) =>
      fetch(`https://api.telegram.org/bot${token}/createInvoiceLink`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "LangLang Pro — подписка на 30 дней",
          description:
            "Безлимитные голосовые проверки, генерация колод с ИИ и умные закрепляющие колоды",
          payload,
          currency: "XTR",
          prices: [{ label: "Подписка Pro (30 дней)", amount: STARS_PRICE }],
          ...(withSubscription ? { subscription_period: SUBSCRIPTION_PERIOD_SECONDS } : {}),
        }),
      }).then((r) => r.json());

    let invoice = await createInvoice(true);
    if (!invoice?.ok && invoice?.description?.includes?.("subscription_period")) {
      // Older Bot API without subscription support → one-time 30-day payment
      invoice = await createInvoice(false);
    }

    if (!invoice?.ok || !invoice?.result) {
      console.error("createInvoiceLink failed:", invoice?.description);
      return NextResponse.json(
        { success: false, error: invoice?.description || "Не удалось создать счёт" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: "stars",
      price: {
        uzs: "39 000 UZS",
        rub: "290 ₽",
        stars: STARS_PRICE,
      },
      checkout_url: invoice.result,
      payload,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout error";
    console.error("POST /api/checkout error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
