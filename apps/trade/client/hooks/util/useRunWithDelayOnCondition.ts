import { SetTimeoutReturnType } from '@nadohq/web-common';
import { useEffect } from 'react';

interface Params {
  condition: boolean;
  /**
   * Delay duration in milliseconds
   * @default RUN_WITH_DELAY_DURATIONS.DEFAULT (2000ms)
   *
   * Use standard durations from RUN_WITH_DELAY_DURATIONS:
   * - SHORT (1000ms): High-frequency user interactions, quick feedback loops, order placements
   * - DEFAULT (2000ms): Standard operations, dialog dismissals, state resets
   * - LONG (5000ms): Collateral transactions (deposits, withdrawals, ERC20 approvals)
   */
  delay?: number;

  fn(): void;
}

/**
 * Calls a function after a delay if the given condition is true
 */
export function useRunWithDelayOnCondition({
  condition,
  fn,
  delay = RUN_WITH_DELAY_DURATIONS.DEFAULT,
}: Params) {
  useEffect(
    () => {
      let timeout: SetTimeoutReturnType | undefined;
      if (condition) {
        timeout = setTimeout(() => {
          fn();
        }, delay);
      }

      return () => {
        clearTimeout(timeout);
      };
    },
    // Run only on condition changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [condition],
  );
}

/**
 * Standard delay durations for useRunWithDelayOnCondition hook
 */
export const RUN_WITH_DELAY_DURATIONS = {
  /**
   * Short delay (1 second)
   * Use for: High-frequency user interactions, quick feedback loops, order placements
   */
  SHORT: 1000,

  /**
   * Default delay (2 seconds)
   * Use for: Standard operations, dialog dismissals, state resets, non-collateral transactions
   */
  DEFAULT: 2000,

  /**
   * Long delay (5 seconds)
   * Use for: Collateral-related transactions (deposits, withdrawals, ERC20 approvals, transfers)
   */
  LONG: 5000,
} as const;
