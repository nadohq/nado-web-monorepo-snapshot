import {
  BigNumbers,
  calcIndexerPerpBalanceValue,
  calcIndexerSpotBalanceValue,
  IndexerSubaccountSnapshot,
  ProductEngineType,
} from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { calcIndexerCumulativePerpEntryCost } from '../perp/perpEntryCostCalcs';
import { calcIndexerSummaryCumulativePnl } from '../pnlCalcs';

/**
 * Values are NOT decimal adjusted
 */
export interface IndexerSubaccountMetrics {
  /** These metrics are in terms of quote (USDT) when valid */
  portfolioValue: BigNumber;
  /** Pnls include both closed & open positions */
  /** Account wide */
  cumulativeAccountPnl: BigNumber;
  /** Perp only */
  cumulativeTotalPerpPnl: BigNumber;
  cumulativeSpotVolume: BigNumber;
  cumulativePerpVolume: BigNumber;
  cumulativeTotalVolume: BigNumber;
}

export function getSubaccountMetricsFromIndexerSnapshot(
  indexerSnapshot: IndexerSubaccountSnapshot,
): IndexerSubaccountMetrics {
  let portfolioValue = BigNumbers.ZERO;
  let cumulativeAccountPnl = BigNumbers.ZERO;
  let cumulativeTotalPerpPnl = BigNumbers.ZERO;
  let cumulativePerpEntryCost = BigNumbers.ZERO;
  let cumulativeSpotVolume = BigNumbers.ZERO;
  let cumulativePerpVolume = BigNumbers.ZERO;

  indexerSnapshot.balances.forEach((balance) => {
    const cumulativePnl = calcIndexerSummaryCumulativePnl(balance);

    cumulativeAccountPnl = cumulativeAccountPnl.plus(cumulativePnl);

    const balanceType = balance.state.type;
    const balanceMarket = balance.state.market;

    // Calculate spot balance values, this also includes quote balances in an isolated position
    if (balanceType === ProductEngineType.SPOT) {
      const balanceValue = calcIndexerSpotBalanceValue(
        balance.state.postBalance,
        balanceMarket.product.oraclePrice,
      );

      portfolioValue = portfolioValue.plus(balanceValue);

      cumulativeSpotVolume = cumulativeSpotVolume.plus(
        balance.trackedVars.quoteVolumeCumulative,
      );
    } else if (balanceType === ProductEngineType.PERP) {
      cumulativeTotalPerpPnl = cumulativeTotalPerpPnl.plus(cumulativePnl);

      cumulativePerpEntryCost = cumulativePerpEntryCost.plus(
        calcIndexerCumulativePerpEntryCost(balance),
      );

      cumulativePerpVolume = cumulativePerpVolume.plus(
        balance.trackedVars.quoteVolumeCumulative,
      );

      const unsettledQuote = calcIndexerPerpBalanceValue(
        balance.state.postBalance,
        balanceMarket.product.oraclePrice,
      );
      portfolioValue = portfolioValue.plus(unsettledQuote);
    }
  });

  return {
    portfolioValue,
    cumulativeAccountPnl,
    cumulativeTotalPerpPnl,
    cumulativeSpotVolume,
    cumulativePerpVolume,
    cumulativeTotalVolume: cumulativeSpotVolume.plus(cumulativePerpVolume),
  };
}
