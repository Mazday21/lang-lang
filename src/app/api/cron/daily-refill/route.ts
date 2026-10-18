import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/data/decks";
import { ensureSharedCurriculum, topUpPersonalDecks } from "@/lib/ai/auto-populate";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET /api/cron/daily-refill
 * Scheduled content refill (Vercel Cron, protected by CRON_SECRET).
 *  1. Fills shared curriculum templates for every active language pair.
 *  2. Tops up personal decks for users who are low on due cards.
 * Bounded work per run to stay within serverless limits.
 */

const MAX_USERS_PER_RUN = 20;
const KNOWN_PAIRS = ["ru-uz", "ru-en", "uz-ru", "uz-en", "ru-it", "uz-it"];

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const auth = req.headers.get("authorization");
      if (auth !== `Bearer ${secret}`) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, skipped: "supabase_not_configured" });
    }

    const supabase = getSupabaseAdminClient();

    // Load users once: used both as shared-template owners and for personal top-ups.
    // (Shared starter decks require a real user_id due to FK constraints.)
    const { data: users } = await supabase
      .from("users")
      .select("id, native_language, target_language")
      .order("updated_at", { ascending: false })
      .limit(MAX_USERS_PER_RUN);

    const defaultOwner = users?.[0]?.id || null;

    // 1. Shared curriculum per known pair (idempotent, cheap when already full)
    const sharedResults: Array<{ pair: string; created: number; skipped: number }> = [];
    for (const pair of KNOWN_PAIRS) {
      const [native, target] = pair.split("-");
      // Owner: a user already learning this pair, otherwise any user, otherwise skip
      const owner =
        users?.find(
          (u) =>
            (u.native_language || "ru").toLowerCase() === native &&
            (u.target_language || "uz").toLowerCase() === target
        )?.id || defaultOwner;

      if (!owner) {
        sharedResults.push({ pair, created: 0, skipped: 0 });
        continue;
      }

      const res = await ensureSharedCurriculum({
        userId: owner,
        native,
        target,
      });
      sharedResults.push({ pair, ...res });
    }

    let toppedUp = 0;
    for (const u of users || []) {
      const native = (u.native_language || "ru").toLowerCase();
      const target = (u.target_language || "uz").toLowerCase();
      const res = await topUpPersonalDecks({ userId: u.id, native, target });
      if (res.created) toppedUp++;
    }

    return NextResponse.json({
      success: true,
      shared: sharedResults,
      users_scanned: users?.length || 0,
      users_topped_up: toppedUp,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Daily refill failed";
    console.error("GET /api/cron/daily-refill error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
