import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/data/decks";
import { setUserPlan } from "@/lib/limits";

/**
 * Telegram Stars payments bookkeeping.
 *
 * Every successful payment is recorded once (unique charge_id → webhook
 * retries are idempotent) and grants a Pro subscription for a number of days.
 * `users.pro_until` stores the expiry; the daily cron downgrades expired Pro.
 */

export interface StarPayment {
  user_id: string;
  charge_id: string;
  stars: number;
  is_recurring: boolean;
}

export const PRO_DAYS_PER_PAYMENT = 30;

// In-memory fallback for local dev mode (globalThis: survives per-route module copies)
const g = globalThis as unknown as {
  __starPayments?: { rows: StarPayment[]; proUntil: Map<string, string> };
};
const mockState = g.__starPayments ||
  (g.__starPayments = { rows: [] as StarPayment[], proUntil: new Map<string, string>() });

/**
 * Records a Stars payment. Returns false when this charge was already
 * processed (idempotency for Telegram webhook redeliveries).
 */
export async function recordStarPayment(payment: StarPayment): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    if (mockState.rows.some((r) => r.charge_id === payment.charge_id)) return false;
    mockState.rows.push(payment);
    return true;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("payments").insert({
      user_id: payment.user_id,
      charge_id: payment.charge_id,
      stars: payment.stars,
      is_recurring: payment.is_recurring,
    });
    if (error) {
      // Unique violation → this charge is already recorded
      if (
        error.code === "23505" ||
        String(error.message).toLowerCase().includes("duplicate")
      ) {
        return false;
      }
      console.warn("payments insert failed:", error.message);
    }
  } catch (err) {
    console.warn("payments insert failed:", err);
  }
  return true;
}

/** Activates the Pro plan for N days and stores the expiry date. */
export async function activatePro(userId: string, days = PRO_DAYS_PER_PAYMENT): Promise<string> {
  const until = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();

  await setUserPlan(userId, "pro");

  if (!isSupabaseConfigured()) {
    mockState.proUntil.set(userId, until);
    return until;
  }

  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("users").update({ pro_until: until }).eq("id", userId);
  } catch (err) {
    // Legacy tables without pro_until: the plan itself is already set
    console.warn("Failed to persist pro_until:", err);
  }
  return until;
}

/** Pro expiry for a user (null when unlimited/unknown). */
export async function getProUntil(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return mockState.proUntil.get(userId) || null;
  }
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("users")
    .select("pro_until")
    .eq("id", userId)
    .maybeSingle();
  return data?.pro_until || null;
}

/**
 * Downgrades users whose Pro subscription has expired.
 * Returns the number of downgraded accounts (used by the daily cron).
 * Dev/tester Pro (no pro_until) is never expired.
 */
export async function expireOverduePro(): Promise<number> {
  const nowIso = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    let expired = 0;
    for (const [userId, until] of Array.from(mockState.proUntil.entries())) {
      if (until < nowIso) {
        mockState.proUntil.delete(userId);
        await setUserPlan(userId, "free");
        expired++;
      }
    }
    return expired;
  }

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("plan", "pro")
    .lt("pro_until", nowIso)
    .limit(200);

  const ids = (data || []).map((r) => r.id);
  if (ids.length > 0) {
    await supabase.from("users").update({ plan: "free" }).in("id", ids);
  }
  return ids.length;
}
