import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/data/decks";

/**
 * User proficiency level (0..10) + placement test state.
 * Set once via the placement mini-test, adjustable by re-taking it.
 */

export interface UserProgress {
  proficiency_level: number;
  placement_tested: boolean;
}

// In-memory fallback for local dev mode
const mockProgress = new Map<string, UserProgress>();

export async function getUserProgress(userId: string): Promise<UserProgress> {
  if (!isSupabaseConfigured()) {
    return mockProgress.get(userId) || { proficiency_level: 0, placement_tested: false };
  }

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("users")
    .select("proficiency_level, placement_tested")
    .eq("id", userId)
    .maybeSingle();

  return {
    proficiency_level: Number(data?.proficiency_level ?? 0),
    placement_tested: Boolean(data?.placement_tested ?? false),
  };
}

/**
 * Saves the placement test result: sets proficiency level (0..10) and marks the test as done.
 */
export async function savePlacementResult(
  userId: string,
  level: number
): Promise<UserProgress> {
  const clamped = Math.min(10, Math.max(0, Math.round(level)));
  const result: UserProgress = {
    proficiency_level: clamped,
    placement_tested: true,
  };

  if (!isSupabaseConfigured()) {
    mockProgress.set(userId, result);
    return result;
  }

  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("users")
    .update({
      proficiency_level: clamped,
      placement_tested: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    // Legacy tables without placement_tested column
    const fallback = await supabase
      .from("users")
      .update({ proficiency_level: clamped, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (fallback.error) {
      throw new Error(fallback.error.message);
    }
  }

  return result;
}
