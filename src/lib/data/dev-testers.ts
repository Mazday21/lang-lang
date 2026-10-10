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

/** True when the Telegram ID belongs to the developer or a tester. */
export async function isDevOrTester(
  telegramId: string | number | null | undefined
): Promise<boolean> {
  if (!isSupabaseConfigured()) return true; // local dev mode

  const id = normalizeTelegramId(telegramId);
  if (!id) return false;
  if (id === DEV_TELEGRAM_ID) return true;

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("dev_testers")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  return Boolean(data);
}

/** Lists all tester Telegram IDs (developer access only). */
export async function listTesters(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return Array.from(mockTesters);
  }

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("dev_testers")
    .select("id")
    .order("added_at", { ascending: true });

  return (data || []).map((r) => normalizeTelegramId(r.id));
}

/** Adds a tester by Telegram ID. Returns false for invalid/dev ids. */
export async function addTester(telegramId: string | number): Promise<boolean> {
  const id = normalizeTelegramId(telegramId);
  if (!id || id === DEV_TELEGRAM_ID) return false;

  if (!isSupabaseConfigured()) {
    mockTesters.add(id);
    return true;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("dev_testers").upsert({ id });
  return !error;
}

/** Removes a tester by Telegram ID. */
export async function removeTester(telegramId: string | number): Promise<void> {
  const id = normalizeTelegramId(telegramId);
  if (!id) return;

  if (!isSupabaseConfigured()) {
    mockTesters.delete(id);
    return;
  }

  const supabase = getSupabaseAdminClient();
  await supabase.from("dev_testers").delete().eq("id", id);
}
