import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;
let currentToken: string | null = null;

export function getSupabaseClient(accessToken?: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  // If token changed or instance not created yet, re-instantiate
  if (!clientInstance || currentToken !== (accessToken || null)) {
    currentToken = accessToken || null;
    clientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      },
    });
  }

  return clientInstance;
}
