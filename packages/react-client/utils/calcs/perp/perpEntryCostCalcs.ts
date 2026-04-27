import { BigNumbers, IndexerSnapshotBalance } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

export function calcPerpEntryCostBeforeLeverage(
  longWeightInitial: BigNumber,
  netEntryUnrealized: BigNumber,
) {
  // Ex. if weight is 0.9, this is 0.1 (adjusts from entry cost INCLUDING 10x leverage)
  const leverageAdjustment = BigNumbers.ONE.minus(longWeightInitial);

  return netEntryUnrealized.abs().multipliedBy(leverageAdjustment);
}

/**
 * The entry "cost" (absolute value) is the amount of USDT used to enter the position BEFORE leverage
 * @param indexerBalance The indexer balance data
 * @returns The unrealized perpetual entry cost before leverage
 */
export function calcIndexerUnrealizedPerpEntryCost(
  indexerBalance: IndexerSnapshotBalance,
) {
  return calcPerpEntryCostBeforeLeverage(
    indexerBalance.state.market.product.longWeightInitial,
    indexerBalance.trackedVars.netEntryUnrealized,
  );
}

/**
 * Calculates the cumulative perpetual entry cost before leverage
 * @param indexerBalance The indexer balance data
 * @returns The cumulative perpetual entry cost before leverage
 */
export function calcIndexerCumulativePerpEntryCost(
  indexerBalance: IndexerSnapshotBalance,
) {
  return calcPerpEntryCostBeforeLeverage(
    indexerBalance.state.market.product.longWeightInitial,
    indexerBalance.trackedVars.netEntryCumulative,
  );
}
