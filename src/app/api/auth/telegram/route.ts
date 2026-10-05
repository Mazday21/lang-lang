import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramInitData } from "@/lib/telegram/verify";
import { upsertTelegramUser } from "@/lib/supabase/server";
import { signSupabaseToken } from "@/lib/auth/token";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { initData, isDevMock } = body;

    // Local Development Mock bypass
    if (process.env.NODE_ENV === "development" && (isDevMock || initData === "dev_mock")) {
      const mockTelegramId = 999999999;
      const mockFirstName = "Dev User";
      const mockUsername = "dev_learner";

      let userId = "00000000-0000-0000-0000-000000000001";
      let token = "mock-dev-token";

      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.SUPABASE_JWT_SECRET
      ) {
        try {
          const user = await upsertTelegramUser({
            id: mockTelegramId,
            first_name: mockFirstName,
            username: mockUsername,
          });
          userId = user.id;
          token = await signSupabaseToken(
            {
              userId: user.id,
              telegramId: mockTelegramId,
              firstName: mockFirstName,
              username: mockUsername,
            },
            process.env.SUPABASE_JWT_SECRET
          );
        } catch (dbErr) {
          console.warn("Dev mock: Supabase connection failed, continuing with mock IDs:", dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          telegram_id: mockTelegramId,
          first_name: mockFirstName,
          username: mockUsername,
        },
        token,
        isDev: true,
      });
    }

    if (!initData) {
      return NextResponse.json(
        { success: false, error: "InitData is required" },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        {
          success: false,
          error: "TELEGRAM_BOT_TOKEN is not configured on the server",
        },
        { status: 500 }
      );
    }

    const verification = verifyTelegramInitData(initData, botToken);
    if (!verification.isValid || !verification.data) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error || "Invalid Telegram authentication data",
        },
        { status: 401 }
      );
    }

    const tgUser = verification.data.user;

    // Check if Supabase is configured
    const hasSupabaseConfig =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_JWT_SECRET;

    if (!hasSupabaseConfig) {
      // Supabase credentials not yet supplied in .env.local
      return NextResponse.json({
        success: true,
        user: {
          id: `tg_${tgUser.id}`,
          telegram_id: tgUser.id,
          first_name: tgUser.first_name,
          username: tgUser.username,
        },
        token: "unconfigured-supabase-token",
        warning: "Supabase environment variables not configured yet.",
      });
    }

    // Upsert user in Supabase
    const dbUser = await upsertTelegramUser({
      id: tgUser.id,
      first_name: tgUser.first_name,
      username: tgUser.username,
    });

    // Mint custom JWT for Supabase RLS
    const token = await signSupabaseToken(
      {
        userId: dbUser.id,
        telegramId: dbUser.telegram_id,
        firstName: dbUser.first_name || undefined,
        username: dbUser.username || undefined,
      },
      process.env.SUPABASE_JWT_SECRET!
    );

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        telegram_id: dbUser.telegram_id,
        first_name: dbUser.first_name,
        username: dbUser.username,
      },
      token,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("Auth API error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
