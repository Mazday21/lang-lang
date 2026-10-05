import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export interface UpsertUserResult {
  id: string;
  telegram_id: number;
  first_name: string | null;
  username: string | null;
}

/**
 * Upserts a Telegram user in Supabase public.users using Service Role key.
 */
export async function upsertTelegramUser(telegramUser: {
  id: number;
  first_name: string;
  username?: string;
}): Promise<UpsertUserResult> {
  const adminClient = getSupabaseAdminClient();

  // 1. Check if user already exists
  const { data: existingUser, error: selectError } = await adminClient
    .from("users")
    .select("id, telegram_id, first_name, username")
    .eq("telegram_id", telegramUser.id)
    .maybeSingle();

  if (selectError) {
    console.error("Error looking up user in Supabase:", selectError);
    throw new Error(`Failed to check existing user: ${selectError.message}`);
  }

  if (existingUser) {
    // Update name/username if changed
    const { data: updatedUser, error: updateError } = await adminClient
      .from("users")
      .update({
        first_name: telegramUser.first_name,
        username: telegramUser.username || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingUser.id)
      .select("id, telegram_id, first_name, username")
      .single();

    if (updateError) {
      console.warn("Could not update user metadata:", updateError);
      return existingUser;
    }

    return updatedUser;
  }

  // 2. Create new user in public.users
  const { data: newUser, error: insertError } = await adminClient
    .from("users")
    .insert({
      telegram_id: telegramUser.id,
      first_name: telegramUser.first_name,
      username: telegramUser.username || null,
    })
    .select("id, telegram_id, first_name, username")
    .single();

  if (insertError) {
    console.error("Error inserting user into Supabase:", insertError);
    throw new Error(`Failed to create user record: ${insertError.message}`);
  }

  return newUser;
}
