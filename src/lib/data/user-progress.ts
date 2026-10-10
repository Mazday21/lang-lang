import { getSupabaseAdminClient } from "@/lib/supabase/server";
import {
  isSupabaseConfigured,
  getUserMasteredPoints,
  countCardsReviewedToday,
} from "@/lib/data/decks";

/**
 * Dynamic proficiency level (0..10):
 *   proficiency_level = base_level + study bonus (monotonic, never decreases).
 *
 * base_level  — placement test result or manual choice (0..10).
 * study bonus — +1 level per POINTS_PER_LEVEL "knowledge points": every mastered card
 *               (SM-2 repetitions >= 2) weighs its deck's difficulty (1..5).
 * So the level grows gradually as words are memorized, and harder decks grow it faster.
 */

export const POINTS_PER_LEVEL = 15;

/**
 * Comfortable daily review plan: enough to make progress, never scary.
 * The rest of the backlog calmly waits in the queue for tomorrow.
 */
export const DAILY_REVIEW_LIMIT = 15;

export interface UserProgress {
  proficiency_level: number; // current dynamic level (0..10), shown in the UI
  base_level: number;        // from placement test / manual choice
  placement_tested: boolean;
  learned_points: number;    // knowledge points earned by studying
  mastered_cards: number;
  reviewed_today: number;    // cards already reviewed today (daily plan progress)
}

interface ProgressRow {
  proficiency_level: number;
  base_level: number;
  placement_tested: boolean;
}

// In-memory fallback for local dev mode
const mockRows = new Map<string, ProgressRow>();

const clampLevel = (n: number) => Math.min(10, Math.max(0, Math.round(n)));

async function readRow(userId: string): Promise<ProgressRow> {
  if (!isSupabaseConfigured()) {
    return mockRows.get(userId) || { proficiency_level: 0, base_level: 0, placement_tested: false };
  }

  const supabase = getSupabaseAdminClient();
  const primary = await supabase
    .from("users")
    .select("proficiency_level, base_level, placement_tested")
    .eq("id", userId)
    .maybeSingle();

  let data: any = primary.data;
  let error = primary.error;

  if (error || !data) {
    // Legacy tables without base_level column
    const legacy = await supabase
      .from("users")
      .select("proficiency_level, placement_tested")
      .eq("id", userId)
      .maybeSingle();
    data = legacy.data;
    error = legacy.error;
    if (error || !data) {
      return { proficiency_level: 0, base_level: 0, placement_tested: false };
    }
    return {
      proficiency_level: Number(data.proficiency_level ?? 0),
      base_level: Number(data.proficiency_level ?? 0),
      placement_tested: Boolean(data.placement_tested ?? false),
    };
  }

  return {
    proficiency_level: Number(data.proficiency_level ?? 0),
    base_level: Number(data.base_level ?? data.proficiency_level ?? 0),
    placement_tested: Boolean(data.placement_tested ?? false),
  };
}

async function writeRow(userId: string, row: ProgressRow): Promise<void> {
  if (!isSupabaseConfigured()) {
    mockRows.set(userId, row);
    return;
  }

  const supabase = getSupabaseAdminClient();
  const payload = {
    proficiency_level: row.proficiency_level,
    base_level: row.base_level,
    placement_tested: row.placement_tested,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("users").update(payload).eq("id", userId);
  if (error) {
    // Legacy tables without base_level/placement_tested columns
    const fallback = await supabase
      .from("users")
      .update({
        proficiency_level: row.proficiency_level,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (fallback.error) {
      throw new Error(fallback.error.message);
    }
  }
}

/**
 * Returns the user's progress and grows the dynamic level from study results
 * (monotonic: the level never decreases).
 */
export async function getUserProgress(userId: string): Promise<UserProgress> {
  const row = await readRow(userId);
  const [{ points, masteredCards }, reviewedToday] = await Promise.all([
    getUserMasteredPoints(userId),
    countCardsReviewedToday(userId),
  ]);

  const bonus = Math.floor(points / POINTS_PER_LEVEL);
  const target = Math.min(10, row.base_level + bonus);
  const level = Math.max(row.proficiency_level, target);

  if (level !== row.proficiency_level) {
    try {
      await writeRow(userId, { ...row, proficiency_level: level });
    } catch (err) {
      console.warn("Failed to persist proficiency level:", err);
    }
  }

  return {
    proficiency_level: level,
    base_level: row.base_level,
    placement_tested: row.placement_tested,
    learned_points: points,
    mastered_cards: masteredCards,
    reviewed_today: reviewedToday,
  };
}

/**
 * Saves a proficiency level chosen via placement test, manual selection or skip.
 * Sets the base level (0..10); the dynamic level keeps its high-water mark and
 * keeps growing from study results afterwards.
 */
export async function savePlacementResult(
  userId: string,
  level: number
): Promise<UserProgress> {
  const row = await readRow(userId);
  const base = clampLevel(level);

  await writeRow(userId, {
    base_level: base,
    proficiency_level: Math.max(row.proficiency_level, base),
    placement_tested: true,
  });

  return getUserProgress(userId);
}
