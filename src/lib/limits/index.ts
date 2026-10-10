import { getSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * AI quotas per plan — sized so that a user hitting the caps EVERY day
 * still leaves the subscription profitable.
 *
 * Unit economics (OpenRouter prices):
 *  - voice transcription (gemini-2.0-flash-lite audio): ~$0.00003 per check
 *  - AI deck generation (xiaomi/mimo-v2.6-flash):       ~$0.0006 per deck
 *
 * Pro subscription: 39 000 UZS / 150 Stars ≈ $3 per month.
 *
 * Worst case for a Pro user at the daily caps, every day:
 *   60 voice × $0.00003 + 5 decks × $0.0006 = $0.005/day ≈ $0.15/month
 * → AI spend stays below ~5% of revenue (even with a 3x safety margin
 *   on the estimates: ≤ $0.45/month, margin still ≥ 85%).
 *
 * Free accounts: 3 voice checks/day within a one-time trial of 5 checks
 * per account; AI deck generation is a Pro feature.
 */

export const FREE_TRIAL_LIMIT = 5;           // lifetime AI checks per free account
export const FREE_DAILY_VOICE_LIMIT = 3;     // voice checks per day (free)
export const PRO_DAILY_VOICE_LIMIT = 60;     // voice checks per day (Pro)
export const PRO_DAILY_GENERATION_LIMIT = 5; // AI deck generations per day (Pro)

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
}

export interface UserLimitStatus {
  plan: "free" | "pro";
  ai_requests_used: number;
  limit: number;
  remaining: number;
  voice: QuotaStatus;
  generation: QuotaStatus;
}

// In-memory store for local dev / unconfigured Supabase
interface MockUserLimit {
  plan: "free" | "pro";
  ai_requests_total: number;
  voice_used: number;
  voice_date: string;
  gen_used: number;
  gen_date: string;
}

const mockLimits = new Map<string, MockUserLimit>();

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function planLimit(plan: "free" | "pro"): number {
  return plan === "pro" ? 999999 : FREE_TRIAL_LIMIT;
}

function voiceLimit(plan: "free" | "pro"): number {
  return plan === "pro" ? PRO_DAILY_VOICE_LIMIT : FREE_DAILY_VOICE_LIMIT;
}

function genLimit(plan: "free" | "pro"): number {
  return plan === "pro" ? PRO_DAILY_GENERATION_LIMIT : 0;
}

function quota(used: number, limit: number): QuotaStatus {
  return { used, limit, remaining: Math.max(0, limit - used) };
}

interface UsageState {
  plan: "free" | "pro";
  trialUsed: number;
  voiceUsed: number;
  genUsed: number;
}

async function readUsage(userId: string): Promise<UsageState> {
  const today = getTodayString();

  if (!isSupabaseConfigured()) {
    const mock =
      mockLimits.get(userId) ||
      ({ plan: "free", ai_requests_total: 0, voice_used: 0, voice_date: today, gen_used: 0, gen_date: today } as MockUserLimit);
    if (mock.voice_date !== today) {
      mock.voice_used = 0;
      mock.voice_date = today;
    }
    if (mock.gen_date !== today) {
      mock.gen_used = 0;
      mock.gen_date = today;
    }
    mockLimits.set(userId, mock);
    return {
      plan: mock.plan,
      trialUsed: mock.ai_requests_total,
      voiceUsed: mock.voice_used,
      genUsed: mock.gen_used,
    };
  }

  const supabase = getSupabaseAdminClient();
  let { data: user, error } = await supabase
    .from("users")
    .select("plan, ai_requests_total, voice_requests_today, voice_last_date, gen_requests_today, gen_last_date")
    .eq("id", userId)
    .single();

  if (error || !user) {
    // Legacy tables without the daily quota columns
    const legacy = await supabase
      .from("users")
      .select("plan, ai_requests_total")
      .eq("id", userId)
      .single();
    if (legacy.error || !legacy.data) {
      return { plan: "free", trialUsed: 0, voiceUsed: 0, genUsed: 0 };
    }
    return {
      plan: legacy.data.plan === "pro" ? "pro" : "free",
      trialUsed: legacy.data.ai_requests_total || 0,
      voiceUsed: 0,
      genUsed: 0,
    };
  }

  return {
    plan: user.plan === "pro" ? "pro" : "free",
    trialUsed: user.ai_requests_total || 0,
    voiceUsed: user.voice_last_date === today ? user.voice_requests_today || 0 : 0,
    genUsed: user.gen_last_date === today ? user.gen_requests_today || 0 : 0,
  };
}

async function writeUsage(
  userId: string,
  update: { trialUsed?: number; voiceUsed?: number; genUsed?: number }
): Promise<void> {
  const today = getTodayString();

  if (!isSupabaseConfigured()) {
    const mock = mockLimits.get(userId);
    if (mock) {
      if (update.trialUsed !== undefined) mock.ai_requests_total = update.trialUsed;
      if (update.voiceUsed !== undefined) {
        mock.voice_used = update.voiceUsed;
        mock.voice_date = today;
      }
      if (update.genUsed !== undefined) {
        mock.gen_used = update.genUsed;
        mock.gen_date = today;
      }
    }
    return;
  }

  const supabase = getSupabaseAdminClient();
  const payload: Record<string, unknown> = {};
  if (update.trialUsed !== undefined) payload.ai_requests_total = update.trialUsed;
  if (update.voiceUsed !== undefined) {
    payload.voice_requests_today = update.voiceUsed;
    payload.voice_last_date = today;
  }
  if (update.genUsed !== undefined) {
    payload.gen_requests_today = update.genUsed;
    payload.gen_last_date = today;
  }

  const { error } = await supabase.from("users").update(payload).eq("id", userId);
  if (error) {
    console.warn("Failed to persist AI usage counters:", error.message);
  }
}

/**
 * Retrieves the current user's AI quota status (trial + daily voice + daily generation).
 */
export async function getUserLimits(userId: string): Promise<UserLimitStatus> {
  const state = await readUsage(userId);

  return {
    plan: state.plan,
    ai_requests_used: state.trialUsed,
    limit: planLimit(state.plan),
    remaining: Math.max(0, planLimit(state.plan) - state.trialUsed),
    voice: quota(state.voiceUsed, voiceLimit(state.plan)),
    generation: quota(state.genUsed, genLimit(state.plan)),
  };
}

/**
 * Consumes 1 voice transcription check (daily quota + free trial).
 */
export async function checkAndConsumeVoiceLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; used: number; plan: string; error?: string }> {
  const state = await readUsage(userId);
  const vLimit = voiceLimit(state.plan);

  if (state.plan === "free" && state.trialUsed >= FREE_TRIAL_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      used: state.trialUsed,
      plan: state.plan,
      error: "Бесплатные AI-проверки (5) исчерпаны — оформите подписку Pro",
    };
  }

  if (state.voiceUsed >= vLimit) {
    return {
      allowed: false,
      remaining: 0,
      used: state.voiceUsed,
      plan: state.plan,
      error: `Дневной лимит голосовых проверок (${vLimit}) исчерпан — продолжите завтра`,
    };
  }

  const voiceUsed = state.voiceUsed + 1;
  const trialUsed = state.plan === "free" ? state.trialUsed + 1 : state.trialUsed;
  await writeUsage(userId, { voiceUsed, trialUsed });

  return {
    allowed: true,
    remaining: Math.max(0, vLimit - voiceUsed),
    used: voiceUsed,
    plan: state.plan,
  };
}

/**
 * Consumes 1 AI deck generation (daily quota, Pro only).
 */
export async function checkAndConsumeGenerationLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; used: number; plan: string; error?: string }> {
  const state = await readUsage(userId);
  const gLimit = genLimit(state.plan);

  if (state.plan !== "pro") {
    return {
      allowed: false,
      remaining: 0,
      used: state.genUsed,
      plan: state.plan,
      error: "Генерация колод с помощью ИИ доступна в подписке Pro",
    };
  }

  if (state.genUsed >= gLimit) {
    return {
      allowed: false,
      remaining: 0,
      used: state.genUsed,
      plan: state.plan,
      error: `Дневной лимит генерации колод (${gLimit}) исчерпан — продолжите завтра`,
    };
  }

  const genUsed = state.genUsed + 1;
  await writeUsage(userId, { genUsed });

  return {
    allowed: true,
    remaining: Math.max(0, gLimit - genUsed),
    used: genUsed,
    plan: state.plan,
  };
}

/**
 * Generic AI check consumption (legacy endpoints): the free trial counter.
 */
export async function checkAndConsumeAILimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; totalToday: number; plan: string; error?: string }> {
  const state = await readUsage(userId);
  const limit = planLimit(state.plan);

  if (state.plan === "free" && state.trialUsed >= FREE_TRIAL_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      totalToday: state.trialUsed,
      plan: state.plan,
      error: "Бесплатные AI-проверки (5) исчерпаны — оформите подписку Pro",
    };
  }

  const trialUsed = state.trialUsed + 1;
  await writeUsage(userId, { trialUsed });

  return {
    allowed: true,
    remaining: Math.max(0, limit - trialUsed),
    totalToday: trialUsed,
    plan: state.plan,
  };
}

/**
 * Resets user limits (for dev and testing)
 */
export async function resetUserLimits(userId: string): Promise<void> {
  await writeUsage(userId, { trialUsed: 0, voiceUsed: 0, genUsed: 0 });
}

/**
 * Upgrades or changes user plan
 */
export async function setUserPlan(userId: string, plan: "free" | "pro"): Promise<void> {
  if (!isSupabaseConfigured()) {
    const mock =
      mockLimits.get(userId) ||
      ({ plan: "free", ai_requests_total: 0, voice_used: 0, voice_date: getTodayString(), gen_used: 0, gen_date: getTodayString() } as MockUserLimit);
    mock.plan = plan;
    mockLimits.set(userId, mock);
    return;
  }

  const supabase = getSupabaseAdminClient();
  await supabase.from("users").update({ plan }).eq("id", userId);
}
