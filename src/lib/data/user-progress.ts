import {
  getUserMasteredPoints,
  countCardsReviewedToday,
  getTodayQueueStatus,
} from "@/lib/data/decks";

/**
 * Study statistics — no user levels, no placement, no plans.
 * Just what the user has actually done: reviewed cards, mastered words and
 * how much of today's queue is left.
 */

/**
 * Comfortable daily review plan: enough to make progress, never scary.
 * The rest of the backlog calmly waits in the queue for tomorrow.
 */
export const DAILY_REVIEW_LIMIT = 15;

export interface UserProgress {
  learned_points: number;    // knowledge points earned by studying
  mastered_cards: number;    // cards with stable SM-2 memory
  reviewed_today: number;    // cards already reviewed today (daily plan progress)
  queue_total: number;       // size of today's saved mix queue («Колода на сегодня»)
  queue_remaining: number;   // queue cards left — first priority in «Повторение на сегодня»
}

export async function getUserProgress(userId: string): Promise<UserProgress> {
  const [{ points, masteredCards }, reviewedToday, queue] = await Promise.all([
    getUserMasteredPoints(userId),
    countCardsReviewedToday(userId),
    getTodayQueueStatus(userId),
  ]);

  return {
    learned_points: points,
    mastered_cards: masteredCards,
    reviewed_today: reviewedToday,
    queue_total: queue.total,
    queue_remaining: queue.remaining,
  };
}
