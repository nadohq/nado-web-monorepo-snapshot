import {
  BigNumbers,
  IndexerSnapshotBalance,
  QUOTE_PRODUCT_ID,
} from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

export function calcIndexerSummaryUnrealizedPnl(
  indexerBalance: IndexerSnapshotBalance,
  // Alternate oracle price, defaults to the oracle price of the tracked balance
  oraclePrice: BigNumber = indexerBalance.state.market.product.oraclePrice,
) {
  if (indexerBalance.productId === QUOTE_PRODUCT_ID) {
    return BigNumbers.ZERO;
  }

  const unrealizedPnl = calcPnl(
    indexerBalance.state.postBalance.amount,
    oraclePrice,
    indexerBalance.trackedVars.netEntryUnrealized,
  );

  return unrealizedPnl;
}

export function calcIndexerSummaryCumulativePnl(
  indexerBalance: IndexerSnapshotBalance,
) {
  if (indexerBalance.productId === QUOTE_PRODUCT_ID) {
    return BigNumbers.ZERO;
  }
  const cumulativePnl = calcPnl(
    indexerBalance.state.postBalance.amount,
    indexerBalance.state.market.product.oraclePrice,
    indexerBalance.trackedVars.netEntryCumulative,
  );

  return cumulativePnl;
}

/**
 * Calculates fractional PnL, returning zero if denominator is zero
 *
 * @param denominator Either the entry cost for a perp position or the total subaccount value for subaccount-wide
 * @param pnl pnl for the position / subaccount
 */
export function calcPnlFrac(pnl: BigNumber, denominator: BigNumber) {
  return denominator.isZero()
    ? BigNumbers.ZERO
    : // Abs the denom to retain the same sign as pnl
      pnl.div(denominator.abs());
}

/**
 * Calculates fractional PnL, returning undefined if denominator is near-zero
 * @param pnl The profit/loss amount
 * @param denominator The denominator for the calculation
 * @param fallbackDenom Optional fallback denominator if the primary one is near-zero
 * @returns The calculated PnL fraction or undefined if denominator is near-zero
 */
export function calcPnlFracForNonZeroDenom(
  pnl: BigNumber,
  denominator: BigNumber,
  fallbackDenom?: BigNumber,
) {
  const threshold = 0.01;
  if (denominator.abs().gt(threshold)) {
    return pnl.div(denominator.abs());
  }
  if (fallbackDenom && fallbackDenom.abs().gt(threshold)) {
    return pnl.div(fallbackDenom.abs());
  }
  return undefined;
}

export function calcPnl(
  positionAmount: BigNumber,
  price: BigNumber,
  netEntry: BigNumber,
) {
  return positionAmount.multipliedBy(price).minus(netEntry);
}
