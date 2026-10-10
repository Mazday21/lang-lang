import { getSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Free accounts get a one-time trial: 5 AI checks per account (lifetime, no daily reset).
 * Pro accounts have unlimited checks. AI deck generation is a Pro feature.
 */
export const FREE_TRIAL_LIMIT = 5;

export interface UserLimitStatus {
  plan: "free" | "pro";
  ai_requests_used: number;
  limit: number;
  remaining: number;
}

// In-memory store for local dev / unconfigured Supabase
interface MockUserLimit {
  plan: "free" | "pro";
  ai_requests_total: number;
}

const mockLimits = new Map<string, MockUserLimit>();

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function planLimit(plan: "free" | "pro"): number {
  return plan === "pro" ? 999999 : FREE_TRIAL_LIMIT;
}

function status(plan: "free" | "pro", used: number): UserLimitStatus {
  const limit = planLimit(plan);
  return {
    plan,
    ai_requests_used: used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

/**
 * Retrieves the current user's AI limit status.
 */
export async function getUserLimits(userId: string): Promise<UserLimitStatus> {
  if (!isSupabaseConfigured()) {
    const mock = mockLimits.get(userId) || { plan: "free" as const, ai_requests_total: 0 };
    mockLimits.set(userId, mock);
    return status(mock.plan, mock.ai_requests_total);
  }

  const supabase = getSupabaseAdminClient();
  let { data: user, error } = await supabase
    .from("users")
    .select("plan, ai_requests_total")
    .eq("id", userId)
    .single();

  if (error || !user) {
    // Legacy tables without ai_requests_total column
    const legacy = await supabase
      .from("users")
      .select("plan, ai_requests_today")
      .eq("id", userId)
      .single();
    if (legacy.error || !legacy.data) {
      return status("free", 0);
    }
    user = {
      plan: legacy.data.plan,
      ai_requests_total: legacy.data.ai_requests_today || 0,
    };
    error = null;
  }

  const plan = (user.plan === "pro" ? "pro" : "free") as "free" | "pro";
  return status(plan, user.ai_requests_total || 0);
}

/**
 * Checks if the user has available AI requests, and consumes 1 request if allowed.
 */
export async function checkAndConsumeAILimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; totalToday: number; plan: string; error?: string }> {
  const EXHAUSTED = "Бесплатные AI-проверки (5) исчерпаны — оформите подписку Pro";

  if (!isSupabaseConfigured()) {
    const mock = mockLimits.get(userId) || { plan: "free" as const, ai_requests_total: 0 };

    if (mock.plan === "free" && mock.ai_requests_total >= FREE_TRIAL_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        totalToday: mock.ai_requests_total,
        plan: mock.plan,
        error: EXHAUSTED,
      };
    }

    mock.ai_requests_total += 1;
    mockLimits.set(userId, mock);

    return {
      allowed: true,
      remaining: Math.max(0, planLimit(mock.plan) - mock.ai_requests_total),
      totalToday: mock.ai_requests_total,
      plan: mock.plan,
    };
  }

  const supabase = getSupabaseAdminClient();
  let { data: user, error } = await supabase
    .from("users")
    .select("plan, ai_requests_total")
    .eq("id", userId)
    .single();

  if (error || !user) {
    // Legacy tables without ai_requests_total column
    const legacy = await supabase
      .from("users")
      .select("plan, ai_requests_today")
      .eq("id", userId)
      .single();
    if (legacy.error || !legacy.data) {
      // If user record not found yet, allow in fallback
      return { allowed: true, remaining: FREE_TRIAL_LIMIT - 1, totalToday: 1, plan: "free" };
    }
    user = {
      plan: legacy.data.plan,
      ai_requests_total: legacy.data.ai_requests_today || 0,
    };
    error = null;
  }

  const plan = (user.plan === "pro" ? "pro" : "free") as "free" | "pro";
  const used = user.ai_requests_total || 0;

  if (plan === "free" && used >= FREE_TRIAL_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      totalToday: used,
      plan,
      error: EXHAUSTED,
    };
  }

  const updatedCount = used + 1;
  const { error: updateErr } = await supabase
    .from("users")
    .update({ ai_requests_total: updatedCount })
    .eq("id", userId);

  if (updateErr) {
    // Legacy tables: fall back to the old daily counter column
    await supabase
      .from("users")
      .update({ ai_requests_today: updatedCount })
      .eq("id", userId);
  }

  return {
    allowed: true,
    remaining: Math.max(0, planLimit(plan) - updatedCount),
    totalToday: updatedCount,
    plan,
  };
}

/**
 * Resets user limits (for dev and testing)
 */
export async function resetUserLimits(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const mock = mockLimits.get(userId);
    if (mock) {
      mock.ai_requests_total = 0;
    }
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ ai_requests_total: 0 })
    .eq("id", userId);
  if (error) {
    await supabase.from("users").update({ ai_requests_today: 0 }).eq("id", userId);
  }
}

/**
 * Upgrades or changes user plan
 */
export async function setUserPlan(userId: string, plan: "free" | "pro"): Promise<void> {
  if (!isSupabaseConfigured()) {
    const mock = mockLimits.get(userId) || { plan: "free" as const, ai_requests_total: 0 };
    mock.plan = plan;
    mockLimits.set(userId, mock);
    return;
  }

  const supabase = getSupabaseAdminClient();
  await supabase.from("users").update({ plan }).eq("id", userId);
}
