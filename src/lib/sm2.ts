/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * Adapted for 4-button Anki-style review (Again, Hard, Good, Easy)
 * with strict Ease Factor floor (>= 1.30) to prevent "Ease Hell".
 */

export type SM2Grade = 1 | 2 | 3 | 4;

export interface SM2CardData {
  interval: number;       // In days
  repetitions: number;    // Consecutive successful reviews
  ease_factor: number;    // Multiplier (min 1.30, default 2.50)
}

export interface SM2Result {
  interval: number;
  repetitions: number;
  ease_factor: number;
  next_review_at: Date;
}

export const MIN_EASE_FACTOR = 1.30;
export const DEFAULT_EASE_FACTOR = 2.50;

/**
 * Calculates updated SM-2 parameters after a card review.
 * 
 * @param current Current card state (interval, repetitions, ease_factor)
 * @param grade User rating: 1 (Снова), 2 (Трудно), 3 (Хорошо), 4 (Легко)
 * @param now Optional reference date (defaults to current time)
 */
export function calculateSM2(
  current: SM2CardData,
  grade: SM2Grade,
  now: Date = new Date()
): SM2Result {
  const currentInterval = Math.max(0, current.interval || 0);
  const currentReps = Math.max(0, current.repetitions || 0);
  const currentEF = Math.max(MIN_EASE_FACTOR, current.ease_factor || DEFAULT_EASE_FACTOR);

  // Map 1..4 grade to classic SM-2 quality q in [1..5]:
  // 1: Again (q = 1) - forgotten
  // 2: Hard  (q = 3) - remembered with great difficulty
  // 3: Good  (q = 4) - remembered after hesitation
  // 4: Easy  (q = 5) - remembered instantly
  const qMap: Record<SM2Grade, number> = {
    1: 1,
    2: 3,
    3: 4,
    4: 5,
  };
  const q = qMap[grade];

  // Calculate new Ease Factor using classic formula:
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEF = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  let newEaseFactor = currentEF + deltaEF;

  // Clamp Ease Factor >= 1.30 (Mitigation against Ease Hell)
  newEaseFactor = Math.max(MIN_EASE_FACTOR, Math.round(newEaseFactor * 100) / 100);

  let newReps = currentReps;
  let newInterval = currentInterval;

  if (grade === 1) {
    // Again: reset consecutive repetitions, schedule for tomorrow
    newReps = 0;
    newInterval = 1;
  } else if (grade === 2) {
    // Hard: advance repetitions, but increase interval moderately (1.2x)
    newReps = currentReps + 1;
    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 3;
    } else {
      newInterval = Math.max(1, Math.round(currentInterval * 1.2));
    }
  } else if (grade === 3) {
    // Good: standard SM-2 progression
    newReps = currentReps + 1;
    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.max(1, Math.round(currentInterval * newEaseFactor));
    }
  } else if (grade === 4) {
    // Easy: accelerated progression with bonus multiplier
    newReps = currentReps + 1;
    if (newReps === 1) {
      newInterval = 2;
    } else if (newReps === 2) {
      newInterval = 7;
    } else {
      newInterval = Math.max(1, Math.round(currentInterval * newEaseFactor * 1.3));
    }
  }

  // Calculate next review timestamp
  const nextReviewAt = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    interval: newInterval,
    repetitions: newReps,
    ease_factor: newEaseFactor,
    next_review_at: nextReviewAt,
  };
}
