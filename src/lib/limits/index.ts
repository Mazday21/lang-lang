import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const DAILY_FREE_LIMIT = 20;

export interface UserLimitStatus {
  plan: "free" | "pro";
  ai_requests_today: number;
  limit: number;
  remaining: number;
}

// In-memory store for local dev / unconfigured Supabase
interface MockUserLimit {
  plan: "free" | "pro";
  ai_requests_today: number;
  last_request_date: string;
}

const mockLimits = new Map<string, MockUserLimit>();

function getTodayString(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Retrieves the current user's AI limit status.
 */
export async function getUserLimits(userId: string): Promise<UserLimitStatus> {
  const today = getTodayString();

  if (!isSupabaseConfigured()) {
    let mock = mockLimits.get(userId);
    if (!mock) {
      mock = { plan: "free", ai_requests_today: 0, last_request_date: today };
      mockLimits.set(userId, mock);
    } else if (mock.last_request_date !== today) {
      mock.ai_requests_today = 0;
      mock.last_request_date = today;
      mockLimits.set(userId, mock);
    }

    const limit = mock.plan === "pro" ? 999999 : DAILY_FREE_LIMIT;
    return {
      plan: mock.plan,
      ai_requests_today: mock.ai_requests_today,
      limit,
      remaining: Math.max(0, limit - mock.ai_requests_today),
    };
  }

  const supabase = getSupabaseAdminClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("plan, ai_requests_today, last_request_date")
    .eq("id", userId)
    .single();

  if (error || !user) {
    console.warn("Could not fetch user limits from Supabase:", error);
    return {
      plan: "free",
      ai_requests_today: 0,
      limit: DAILY_FREE_LIMIT,
      remaining: DAILY_FREE_LIMIT,
    };
  }

  const plan = (user.plan === "pro" ? "pro" : "free") as "free" | "pro";
  let requestsToday = user.ai_requests_today || 0;

  // Reset if new day
  if (user.last_request_date !== today) {
    requestsToday = 0;
    await supabase
      .from("users")
      .update({ ai_requests_today: 0, last_request_date: today })
      .eq("id", userId);
  }

  const limit = plan === "pro" ? 999999 : DAILY_FREE_LIMIT;
  return {
    plan,
    ai_requests_today: requestsToday,
    limit,
    remaining: Math.max(0, limit - requestsToday),
  };
}

/**
 * Checks if the user has available AI requests, and consumes 1 request if allowed.
 */
export async function checkAndConsumeAILimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; totalToday: number; plan: string; error?: string }> {
  const today = getTodayString();

  if (!isSupabaseConfigured()) {
    let mock = mockLimits.get(userId);
    if (!mock) {
      mock = { plan: "free", ai_requests_today: 0, last_request_date: today };
      mockLimits.set(userId, mock);
    } else if (mock.last_request_date !== today) {
      mock.ai_requests_today = 0;
      mock.last_request_date = today;
    }

    if (mock.plan === "free" && mock.ai_requests_today >= DAILY_FREE_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        totalToday: mock.ai_requests_today,
        plan: mock.plan,
        error: "Дневной лимит AI-проверок (20) исчерпан",
      };
    }

    mock.ai_requests_today += 1;
    mockLimits.set(userId, mock);

    const limit = mock.plan === "pro" ? 999999 : DAILY_FREE_LIMIT;
    return {
      allowed: true,
      remaining: Math.max(0, limit - mock.ai_requests_today),
      totalToday: mock.ai_requests_today,
      plan: mock.plan,
    };
  }

  const supabase = getSupabaseAdminClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("plan, ai_requests_today, last_request_date")
    .eq("id", userId)
    .single();

  if (error || !user) {
    // If user record not found yet, allow in fallback
    return { allowed: true, remaining: DAILY_FREE_LIMIT - 1, totalToday: 1, plan: "free" };
  }

  const plan = (user.plan === "pro" ? "pro" : "free") as "free" | "pro";
  let requestsToday = user.ai_requests_today || 0;

  if (user.last_request_date !== today) {
    requestsToday = 0;
  }

  if (plan === "free" && requestsToday >= DAILY_FREE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      totalToday: requestsToday,
      plan,
      error: "Дневной лимит AI-проверок (20) исчерпан",
    };
  }

  const updatedCount = requestsToday + 1;
  await supabase
    .from("users")
    .update({
      ai_requests_today: updatedCount,
      last_request_date: today,
    })
    .eq("id", userId);

  const limit = plan === "pro" ? 999999 : DAILY_FREE_LIMIT;
  return {
    allowed: true,
    remaining: Math.max(0, limit - updatedCount),
    totalToday: updatedCount,
    plan,
  };
}

/**
 * Resets user limits (for dev and testing)
 */
export async function resetUserLimits(userId: string): Promise<void> {
  const today = getTodayString();
  if (!isSupabaseConfigured()) {
    const mock = mockLimits.get(userId);
    if (mock) {
      mock.ai_requests_today = 0;
      mock.last_request_date = today;
    }
    return;
  }

  const supabase = getSupabaseAdminClient();
  await supabase
    .from("users")
    .update({ ai_requests_today: 0, last_request_date: today })
    .eq("id", userId);
}

/**
 * Upgrades or changes user plan
 */
export async function setUserPlan(userId: string, plan: "free" | "pro"): Promise<void> {
  if (!isSupabaseConfigured()) {
    const mock = mockLimits.get(userId) || {
      plan: "free",
      ai_requests_today: 0,
      last_request_date: getTodayString(),
    };
    mock.plan = plan;
    mockLimits.set(userId, mock);
    return;
  }

  const supabase = getSupabaseAdminClient();
  await supabase.from("users").update({ plan }).eq("id", userId);
}
