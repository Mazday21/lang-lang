/**
 * "Колода на сегодня" mixing algorithm.
 *
 * Base mix for a user level L:
 *   60% cards from decks of level L (the user's level),
 *   20% from decks ABOVE (L+1),
 *   20% from decks BELOW (L-1).
 *
 * Edge cases:
 *   - no higher level available (user studies the top level):
 *       all 40% goes BELOW — split between the two nearest lower levels
 *       (e.g. L=3 → 20% level 2 + 20% level 1);
 *   - no lower level available (user studies level 1):
 *       30% from level L+1 and 10% from level L+2;
 *   - nothing else available: 100% from the user's level.
 */

export interface MixShare {
  level: number;
  percent: number;
}

/** Snaps the user level to the nearest level that actually has cards. */
export function snapToAvailableLevel(availableLevels: number[], userLevel: number): number {
  const levels = Array.from(new Set(availableLevels));
  if (levels.length === 0) return userLevel;
  if (levels.includes(userLevel)) return userLevel;
  return levels.reduce((best, l) =>
    Math.abs(l - userLevel) < Math.abs(best - userLevel) ? l : best
  );
}

/**
 * Returns level shares (0..1) for the today mix based on which levels have cards.
 * Levels without cards are never included in the result.
 */
export function computeMixShares(
  availableLevels: number[],
  userLevel: number
): MixShare[] {
  const levels = Array.from(new Set(availableLevels)).sort((a, b) => a - b);
  if (levels.length === 0) return [];

  const L = snapToAvailableLevel(levels, userLevel);
  const higher = levels.filter((l) => l > L);
  const lower = levels.filter((l) => l < L).sort((a, b) => b - a); // nearest first

  const shares = new Map<number, number>();

  if (higher.length > 0 && lower.length > 0) {
    // Base case: 60% own level, 20% above, 20% below
    shares.set(L, 0.6);
    shares.set(higher[0], 0.2);
    shares.set(lower[0], 0.2);
  } else if (higher.length === 0 && lower.length > 0) {
    // Nothing above: all 40% goes below (up to two nearest lower levels)
    shares.set(L, 0.6);
    const nearestLower = lower.slice(0, 2);
    const share = 0.4 / nearestLower.length;
    for (const level of nearestLower) {
      shares.set(level, (shares.get(level) || 0) + share);
    }
  } else if (higher.length > 0 && lower.length === 0) {
    // Nothing below: 30% next level, 10% level after it
    shares.set(L, 0.6);
    if (higher.length >= 2) {
      shares.set(higher[0], 0.3);
      shares.set(higher[1], 0.1);
    } else {
      shares.set(higher[0], 0.4);
    }
  } else {
    // Everything is on one level
    shares.set(L, 1);
  }

  return Array.from(shares.entries())
    .map(([level, percent]) => ({ level, percent }))
    .sort((a, b) => a.level - b.level);
}
