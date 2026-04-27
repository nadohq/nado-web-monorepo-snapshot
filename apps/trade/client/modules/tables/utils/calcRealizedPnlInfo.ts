import {
  calcPerpEntryCostBeforeLeverage,
  calcPnlFrac,
  safeDiv,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';

export interface RealizedPnlInfo {
  /** Realized PnL in USD */
  pnlUsd: BigNumber;
  /** Realized PnL as a fraction of entry margin cost */
  pnlFrac: BigNumber;
}

interface Params {
  realizedPnlUsd: BigNumber;
  isPerp: boolean;
  closedBaseSize: BigNumber;
  closedNetEntry: BigNumber;
  margin: BigNumber | null;
  preEventPositionSize: BigNumber;
  longWeightInitial: BigNumber;
}

/**
 * Computes realized PnL info for a closed position.
 *
 * For perp isolated: pnlFrac = realizedPnl / scaledMargin
 * For perp cross: pnlFrac = realizedPnl / calcPerpEntryCostBeforeLeverage(longWeightInitial, closedNetEntry)
 * For spot: pnlFrac = realizedPnl / closedNetEntry (raw notional, no leverage adjustment)
 */
export function calcRealizedPnlInfo({
  realizedPnlUsd,
  isPerp,
  closedBaseSize,
  closedNetEntry,
  margin,
  preEventPositionSize,
  longWeightInitial,
}: Params): RealizedPnlInfo | undefined {
  if (closedBaseSize.isZero()) {
    return;
  }

  // `margin` from the backend is the full position margin, not proportional to the closed size.
  // Scale it by the fraction of the position that was closed so PnL % is correct for partial closes
  const scaledMargin = margin
    ? margin.multipliedBy(safeDiv(closedBaseSize, preEventPositionSize))
    : null;

  // For perp isolated: use scaled margin (margin * closedAmount / preEventPositionSize)
  // For perp cross: apply leverage adjustment to closedNetEntry
  // For spot: use raw closedNetEntry (no leverage concept for spot)
  const entryMarginCost = (() => {
    if (isPerp) {
      return (
        scaledMargin ??
        calcPerpEntryCostBeforeLeverage(longWeightInitial, closedNetEntry)
      );
    }
    return closedNetEntry.abs();
  })();

  return {
    pnlUsd: realizedPnlUsd,
    pnlFrac: calcPnlFrac(realizedPnlUsd, entryMarginCost),
  };
}
