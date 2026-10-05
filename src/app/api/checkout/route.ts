import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/get-user-id";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const provider = body.provider || "stars"; // "stars" | "payme" | "platega"

    // Mock bot payment deep link or external payment gateway
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "your_language_bot";
    const checkoutUrl = `https://t.me/${botUsername}?start=pay_pro_${userId.slice(0, 8)}`;

    return NextResponse.json({
      success: true,
      provider,
      price: {
        uzs: "39 000 UZS",
        rub: "290 ₽",
        stars: 150,
      },
      checkout_url: checkoutUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
