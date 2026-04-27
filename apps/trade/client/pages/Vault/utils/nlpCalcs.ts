import { BigNumbers, IndexerNlpSnapshot } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
/**
 * Computes Maximum Drawdown (MDD) from NLP snapshots.
 *
 * Definition:
 * - For each time t, drawdown dd_t = (NAV_t - max(NAV_{0..t})) / max(NAV_{0..t}) (non-positive)
 * - MDD is the absolute value of the minimum drawdown: MDD = |min(dd_t)|
 *
 * @param snapshots - Array of NLP snapshots sorted in descending order by timestamp (newest first, as returned by useQueryNlpSnapshots)
 * @returns Maximum Drawdown as a positive fraction (e.g., 0.25 for 25% drawdown), or undefined if no valid computation is possible
 *
 * Implementation Notes:
 * - Snapshots are reversed to process in chronological order (oldest → newest)
 * - Uses a copy to avoid mutating the input array
 *
 * @example
 * // NAV sequence: 100 → 120 → 110
 * // Running peaks: 100, 120, 120
 * // Drawdowns: 0, 0, (110-120)/120 = -0.08333
 * // MDD = 0.08333 (8.33%)
 */
export function calcNlpMaxDrawdown(
  snapshots: IndexerNlpSnapshot[],
): BigNumber | undefined {
  if (snapshots.length === 0) {
    return undefined;
  }

  // Reverse to process chronologically (oldest → newest)
  // Input comes in descending order (newest first) from useQueryNlpSnapshots
  const reversedSnapshots = [...snapshots].reverse();

  let runningMax = reversedSnapshots[0].oraclePrice;
  let maxDrawdown = BigNumbers.ZERO;

  for (const snapshot of reversedSnapshots) {
    const nav = snapshot.oraclePrice;

    // Update running peak
    if (nav.gt(runningMax)) {
      runningMax = nav;
    }

    // dd_t = (NAV_t - max(NAV_{0..t})) / max(NAV_{0..t})
    const drawdown = nav.minus(runningMax).div(runningMax);

    // Track most negative drawdown
    if (drawdown.lt(maxDrawdown)) {
      maxDrawdown = drawdown;
    }
  }

  // Return magnitude as positive fraction
  return maxDrawdown.abs();
}
