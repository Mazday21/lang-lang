import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/data/decks";

/**
 * Developer & tester accounts for the "Тестирование для разработки" panel.
 * The developer (hardcoded Telegram ID) can add/remove tester accounts by
 * Telegram ID. Dev and testers get the same testing buttons; only the dev
 * can manage the tester list.
 */

export const DEV_TELEGRAM_ID = "403709392";

// In-memory fallback for local dev mode
const mockTesters = new Set<string>();

export function normalizeTelegramId(id: string | number | null | undefined): string {
  return String(id ?? "").replace(/\D/g, "");
}

export function isDevTelegramId(telegramId: string | number | null | undefined): boolean {
  return normalizeTelegramId(telegramId) === DEV_TELEGRAM_ID;
}

/** Resolves the caller's Telegram ID from the internal user id. */
export async function getTelegramIdByUserId(
  userId: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    // Mock mode: treat the internal id as the Telegram id
    return normalizeTelegramId(userId) || null;
  }

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("users")
    .select("telegram_id")
    .eq("id", userId)
    .maybeSingle();

  return data?.telegram_id != null ? normalizeTelegramId(data.telegram_id) : null;
}

/** True in local dev mode (no Supabase) — everyone gets the testing panel there. */
export function isDevEnvironment(): boolean {
  return !isSupabaseConfigured();
}

/** Testers configured via env var (comma-separated Telegram IDs) — always available. */
function envTesters(): string[] {
  return (process.env.DEV_TESTERS || "")
    .split(",")
    .map(normalizeTelegramId)
    .filter(Boolean);
}

/** True when the Telegram ID belongs to the developer or a tester. */
export async function isDevOrTester(
  telegramId: string | number | null | undefined
): Promise<boolean> {
  if (!isSupabaseConfigured()) return true; // local dev mode

  const id = normalizeTelegramId(telegramId);
  if (!id) return false;
  if (id === DEV_TELEGRAM_ID) return true;
  if (envTesters().includes(id)) return true;

  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("dev_testers")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

/** Lists all tester Telegram IDs (developer access only). */
export async function listTesters(): Promise<string[]> {
  const fromEnv = envTesters();

  if (!isSupabaseConfigured()) {
    return Array.from(new Set([...fromEnv, ...Array.from(mockTesters)]));
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from("dev_testers").select("id");
    if (error) {
      console.warn("Failed to list testers:", error.code, error.message);
      return fromEnv;
    }
    return Array.from(
      new Set([...fromEnv, ...(data || []).map((r) => normalizeTelegramId(r.id))])
    ).sort((a, b) => Number(a) - Number(b));
  } catch {
    return fromEnv;
  }
}

export interface TesterActionResult {
  ok: boolean;
  error?: string;
}

export interface TesterProfile {
  id: string;
  username: string | null;
  first_name: string | null;
}

/** Fetches a user's @username via the Telegram Bot API (works once the user started the bot). */
async function fetchTelegramProfile(
  chatId: string
): Promise<{ username: string | null; first_name: string | null }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { username: null, first_name: null };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${chatId}`);
    const data = await res.json();
    if (data?.ok && data.result) {
      return {
        username: data.result.username || null,
        first_name: data.result.first_name || null,
      };
    }
  } catch {
    // Ignore — profile stays unknown
  }
  return { username: null, first_name: null };
}

/**
 * Resolves tester profiles (@username / first name) next to their Telegram IDs.
 * Source order: our users table → Telegram Bot API → null.
 */
export async function getTesterProfiles(ids: string[]): Promise<TesterProfile[]> {
  const unique = Array.from(new Set(ids.map(normalizeTelegramId).filter(Boolean)));
  const byId = new Map<string, TesterProfile>();

  if (isSupabaseConfigured() && unique.length > 0) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data } = await supabase
        .from("users")
        .select("telegram_id, username, first_name")
        .in("telegram_id", unique.map((id) => Number(id)));
      for (const row of data || []) {
        const id = normalizeTelegramId(row.telegram_id);
        byId.set(id, {
          id,
          username: row.username || null,
          first_name: row.first_name || null,
        });
      }
    } catch {
      // Fall through to the Bot API
    }
  }

  for (const id of unique) {
    if (!byId.has(id)) {
      const profile = await fetchTelegramProfile(id);
      byId.set(id, { id, ...profile });
    }
  }

  return unique.map((id) => byId.get(id) || { id, username: null, first_name: null });
}

/** Diagnoses a dev_testers failure: missing table vs stale schema cache vs permissions. */
async function diagnoseTesterError(error: { code?: string; message?: string }): Promise<string> {
  const code = error.code || "";
  const msg = error.message || "";

  if (code === "42P01") {
    return "Таблица dev_testers не найдена — выполните SQL из supabase/schema.sql";
  }
  if (/permission denied/i.test(msg) || code === "42501") {
    return "Нет прав на запись в dev_testers — выполните: grant all on table public.dev_testers to service_role;";
  }

  // Probe: read access tells "invisible to PostgREST" apart from other issues
  try {
    const supabase = getSupabaseAdminClient();
    const probe = await supabase.from("dev_testers").select("id").limit(1);
    if (probe.error) {
      return "PostgREST не видит таблицу dev_testers — в Supabase Studio: Settings → API → «Reload schema» (или подождите минуту)";
    }
  } catch {
    // ignore probe errors
  }

  return `Ошибка dev_testers${code ? ` (${code})` : ""}: ${msg}`;
}

/** Adds a tester by Telegram ID. */
export async function addTester(telegramId: string | number): Promise<TesterActionResult> {
  const id = normalizeTelegramId(telegramId);
  if (!id) return { ok: false, error: "Укажите числовой Telegram ID" };
  if (id === DEV_TELEGRAM_ID) {
    return { ok: false, error: "Это ID разработчика — у него доступ уже есть" };
  }

  if (!isSupabaseConfigured()) {
    mockTesters.add(id);
    return { ok: true };
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("dev_testers").upsert({ id });
  if (error) {
    // Retry with a plain insert (helps when upsert's conflict resolution is unsupported)
    const retry = await supabase.from("dev_testers").insert({ id });
    if (!retry.error) return { ok: true };
    return { ok: false, error: await diagnoseTesterError(retry.error) };
  }

  return { ok: true };
}

/** Removes a tester by Telegram ID. */
export async function removeTester(telegramId: string | number): Promise<TesterActionResult> {
  const id = normalizeTelegramId(telegramId);
  if (!id) return { ok: false, error: "Укажите числовой Telegram ID" };

  if (!isSupabaseConfigured()) {
    mockTesters.delete(id);
    return { ok: true };
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("dev_testers").delete().eq("id", id);
  if (error) {
    return { ok: false, error: await diagnoseTesterError(error) };
  }

  return { ok: true };
}
