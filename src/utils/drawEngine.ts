/**
 * Build the eligible number pool from range minus exclusions.
 */
export function buildEligiblePool(
  start: number,
  end: number,
  excluded: number[]
): number[] {
  const excludeSet = new Set(excluded);
  const pool: number[] = [];
  for (let i = start; i <= end; i++) {
    if (!excludeSet.has(i)) {
      pool.push(i);
    }
  }
  return pool;
}

/**
 * Fisher-Yates shuffle (in-place) and take first N elements.
 * Guarantees exactly N unique numbers from the pool.
 */
export function selectUniqueWinners(pool: number[], count: number): number[] {
  if (count > pool.length) {
    throw new Error(
      `Cannot select ${count} winners from pool of ${pool.length}`
    );
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count).sort((a, b) => a - b);
}

/**
 * Run a complete draw: build pool, select winners.
 */
export function runDraw(
  start: number,
  end: number,
  excluded: number[],
  winnerCount: number
): number[] {
  const pool = buildEligiblePool(start, end, excluded);
  if (winnerCount > pool.length) {
    throw new Error(
      `Winner count (${winnerCount}) exceeds available pool (${pool.length})`
    );
  }
  return selectUniqueWinners(pool, winnerCount);
}

/**
 * Validate draw configuration.
 */
export function validateConfig(
  start: number,
  end: number,
  winnerCount: number,
  excluded: number[]
): string | null {
  if (start < 0 || end < 0) return 'Numbers must be non-negative';
  if (start > end) return 'Start number must be less than or equal to end number';
  if (winnerCount < 1) return 'Winner count must be at least 1';

  const poolSize = buildEligiblePool(start, end, excluded).length;
  if (winnerCount > poolSize) {
    return `Winner count (${winnerCount}) exceeds available numbers (${poolSize})`;
  }

  for (const num of excluded) {
    if (num < start || num > end) {
      return `Excluded number ${num} is outside the range ${start}–${end}`;
    }
  }

  return null;
}
