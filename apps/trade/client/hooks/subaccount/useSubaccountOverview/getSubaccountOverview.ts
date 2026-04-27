import {
  BigNumbers,
  calcPerpBalanceNotionalValue,
  calcSpotBalanceValue,
  IndexerOraclePrice,
  IndexerSubaccountSnapshot,
  ProductEngineType,
  QUOTE_PRODUCT_ID,
  removeDecimals,
  SubaccountSummaryState,
} from '@nadohq/client';
import {
  AnnotatedIsolatedPositionWithProduct,
  calcCrossPositionMarginWithoutPnl,
  calcIndexerSummaryUnrealizedPnl,
  calcIndexerUnrealizedPerpEntryCost,
  calcIsoPositionNetMargin,
  calcPnlFrac,
  calcSubaccountLeverage,
  calcSubaccountMarginUsageFractions,
  calcTotalPortfolioValues,
  getSubaccountMetricsFromIndexerSnapshot,
  safeDiv,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { SpotInterestRate } from 'client/hooks/markets/useSpotInterestRates';
import { AllLatestMarketPricesData } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { SubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/types';
import { getEstimatedExitPrice } from 'client/utils/getEstimatedExitPrice';
import { mapValues } from 'lodash';

interface GetSubaccountOverviewParams {
  subaccountSummary: SubaccountSummaryState;
  isolatedPositions: AnnotatedIsolatedPositionWithProduct[];
  indexerSnapshot: IndexerSubaccountSnapshot | undefined;
  spotInterestRates: Record<number, SpotInterestRate> | undefined;
  latestOraclePrices: Record<number, IndexerOraclePrice> | undefined;
  latestMarketPrices: AllLatestMarketPricesData | undefined;
}

export function getSubaccountOverview({
  subaccountSummary,
  isolatedPositions,
  indexerSnapshot,
  spotInterestRates,
  latestOraclePrices,
  latestMarketPrices,
}: GetSubaccountOverviewParams): SubaccountOverview {
  // Spot
  let totalBorrowsValue = BigNumbers.ZERO;
  let totalDepositsValue = BigNumbers.ZERO;
  let depositAPYWeightedByValue = BigNumbers.ZERO;
  let totalSpotUnrealizedPnl = BigNumbers.ZERO;

  // This SHOULD be negative to calculate average interest rate across borrow/deposit
  let borrowAPYWeightedByValue = BigNumbers.ZERO;
  let totalNetInterestCumulativeUsd = BigNumbers.ZERO;
  // Perp cross
  let totalCrossPerpCollateralUsed = BigNumbers.ZERO;
  let totalCrossPerpUnrealizedPnl = BigNumbers.ZERO;
  let totalCrossPerpUnrealizedEntryCost = BigNumbers.ZERO;
  // Perp iso
  let totalIsoPerpNotionalValue = BigNumbers.ZERO;
  let totalIsoPerpNetMargin = BigNumbers.ZERO;
  let totalIsoPerpUnrealizedPnl = BigNumbers.ZERO;
  let totalIsoPerpUnrealizedEntryCost = BigNumbers.ZERO;

  /**
   * Subaccount calcs
   */
  const marginUsageFractions =
    calcSubaccountMarginUsageFractions(subaccountSummary);
  const decimalAdjustedInitialMargin = removeDecimals(
    subaccountSummary.health.initial.health,
  );
  const decimalAdjustedMaintMargin = removeDecimals(
    subaccountSummary.health.maintenance.health,
  );
  const decimalAdjustedTotalPortfolioValues = mapValues(
    calcTotalPortfolioValues(subaccountSummary),
    (val) => removeDecimals(val),
  );

  // Iterate through perp isolated positions, this needs to be done first so that we can include USDT used as margin in spot calculations
  isolatedPositions.forEach((position) => {
    const baseProductId = position.baseBalance.productId;

    const indexerBalance = indexerSnapshot?.balances.find(
      (indexerSnapshotBalance) => {
        return (
          indexerSnapshotBalance.productId === baseProductId &&
          indexerSnapshotBalance.isolated
        );
      },
    );

    const oraclePrice =
      latestOraclePrices?.[baseProductId]?.oraclePrice ??
      position.baseBalance.oraclePrice;

    totalIsoPerpNotionalValue = totalIsoPerpNotionalValue.plus(
      calcPerpBalanceNotionalValue(position.baseBalance),
    );
    totalIsoPerpNetMargin = totalIsoPerpNetMargin.plus(
      calcIsoPositionNetMargin(position.baseBalance, position.quoteBalance),
    );

    if (indexerBalance) {
      const estimatedExitPrice =
        getEstimatedExitPrice(
          position.baseBalance.amount.isPositive(),
          latestMarketPrices?.[baseProductId],
        ) ?? oraclePrice;
      const unrealizedPnl = calcIndexerSummaryUnrealizedPnl(
        indexerBalance,
        estimatedExitPrice,
      );

      totalIsoPerpUnrealizedPnl = totalIsoPerpUnrealizedPnl.plus(unrealizedPnl);
      totalIsoPerpUnrealizedEntryCost = totalIsoPerpUnrealizedEntryCost.plus(
        calcIndexerUnrealizedPerpEntryCost(indexerBalance),
      );
    }
  });

  // Iterate through cross balances
  subaccountSummary.balances.forEach((balance) => {
    const indexerBalance = indexerSnapshot?.balances.find(
      (indexerSnapshotBalance) => {
        return (
          indexerSnapshotBalance.productId === balance.productId &&
          !indexerSnapshotBalance.isolated
        );
      },
    );

    /**
     * Spot calcs
     */
    if (balance.type === ProductEngineType.SPOT) {
      const balanceValueWithoutIsoMargin = calcSpotBalanceValue(balance);
      // Positive for deposits, negative for borrows
      // For the quote balance, we want to add the net margin in isolated positions so that we treat isolated margin as a deposit
      const balanceValueWithDecimals =
        balance.productId === QUOTE_PRODUCT_ID
          ? balanceValueWithoutIsoMargin.plus(totalIsoPerpNetMargin)
          : balanceValueWithoutIsoMargin;
      // APYs are always positive
      const apys = spotInterestRates?.[balance.productId];

      if (balanceValueWithDecimals.lt(0)) {
        totalBorrowsValue = totalBorrowsValue.plus(balanceValueWithDecimals);

        if (apys) {
          borrowAPYWeightedByValue = borrowAPYWeightedByValue.plus(
            apys.borrow.multipliedBy(balanceValueWithDecimals),
          );
        }
      } else if (balanceValueWithDecimals.gt(0)) {
        totalDepositsValue = totalDepositsValue.plus(balanceValueWithDecimals);

        if (apys) {
          depositAPYWeightedByValue = depositAPYWeightedByValue.plus(
            apys.deposit.multipliedBy(balanceValueWithDecimals),
          );
        }
      }

      if (indexerBalance) {
        const netInterestCumulativeUsd =
          indexerBalance.trackedVars.netInterestCumulative.multipliedBy(
            indexerBalance.state.market.product.oraclePrice,
          );
        const unrealizedPnl = calcIndexerSummaryUnrealizedPnl(indexerBalance);

        totalNetInterestCumulativeUsd = totalNetInterestCumulativeUsd.plus(
          netInterestCumulativeUsd,
        );

        totalSpotUnrealizedPnl = totalSpotUnrealizedPnl.plus(
          removeDecimals(unrealizedPnl),
        );
      }
    }

    /**
     * Perp calcs
     */
    if (balance.type === ProductEngineType.PERP) {
      const oraclePrice =
        latestOraclePrices?.[balance.productId]?.oraclePrice ??
        balance.oraclePrice;

      totalCrossPerpCollateralUsed = totalCrossPerpCollateralUsed.plus(
        calcCrossPositionMarginWithoutPnl(balance),
      );

      if (indexerBalance) {
        const estimatedExitPrice =
          getEstimatedExitPrice(
            balance.amount.isPositive(),
            latestMarketPrices?.[balance.productId],
          ) ?? oraclePrice;
        const unrealizedPnl = calcIndexerSummaryUnrealizedPnl(
          indexerBalance,
          estimatedExitPrice,
        );

        totalCrossPerpUnrealizedPnl =
          totalCrossPerpUnrealizedPnl.plus(unrealizedPnl);
        totalCrossPerpUnrealizedEntryCost =
          totalCrossPerpUnrealizedEntryCost.plus(
            calcIndexerUnrealizedPerpEntryCost(indexerBalance),
          );
      }
    }
  });

  // Spot calcs
  const totalAbsSpotValue = totalDepositsValue.plus(totalBorrowsValue.abs());
  const totalAPYWeightedByValue = depositAPYWeightedByValue.plus(
    borrowAPYWeightedByValue,
  );
  const averageDepositAPYFraction = safeDiv(
    depositAPYWeightedByValue,
    totalDepositsValue,
  );
  const averageBorrowAPYFraction = safeDiv(
    borrowAPYWeightedByValue,
    totalBorrowsValue,
  );
  const averageSpotAPYFraction = safeDiv(
    totalAPYWeightedByValue,
    totalAbsSpotValue,
  );

  // Perp calcs
  const perpCrossMetrics = ((): SubaccountOverview['perp']['cross'] => {
    const entryCost = removeDecimals(totalCrossPerpUnrealizedEntryCost);
    const totalUnrealizedPnl = removeDecimals(totalCrossPerpUnrealizedPnl);
    const totalUnrealizedPnlFrac = calcPnlFrac(totalUnrealizedPnl, entryCost);

    return {
      totalNotionalValueUsd: decimalAdjustedTotalPortfolioValues.perpNotional,
      totalUnsettledQuote: decimalAdjustedTotalPortfolioValues.perp,
      totalUnrealizedPnlUsd: totalUnrealizedPnl,
      totalUnrealizedPnlFrac,
      totalMarginUsedUsd: removeDecimals(totalCrossPerpCollateralUsed),
    };
  })();

  const perpIsoMetrics = ((): SubaccountOverview['perp']['iso'] => {
    const totalUnrealizedPnl = removeDecimals(totalIsoPerpUnrealizedPnl);
    const totalNetMargin = removeDecimals(totalIsoPerpNetMargin);
    const totalUnrealizedPnlFrac = calcPnlFrac(
      totalUnrealizedPnl,
      totalNetMargin,
    );

    return {
      totalNetMarginUsd: removeDecimals(totalIsoPerpNetMargin),
      totalNotionalValueUsd: removeDecimals(totalIsoPerpNotionalValue),
      totalUnrealizedPnlFrac,
      totalUnrealizedPnlUsd: totalUnrealizedPnl,
    };
  })();

  const totalPerpNotionalValue = perpCrossMetrics.totalNotionalValueUsd.plus(
    perpIsoMetrics.totalNotionalValueUsd,
  );
  const totalPerpUnrealizedPnl = perpCrossMetrics.totalUnrealizedPnlUsd.plus(
    perpIsoMetrics.totalUnrealizedPnlUsd,
  );
  const totalPerpUnrealizedPnlFrac = calcPnlFrac(
    totalPerpUnrealizedPnl,
    removeDecimals(totalCrossPerpUnrealizedEntryCost).plus(
      removeDecimals(totalIsoPerpNetMargin),
    ),
  );

  const spotNetCrossBalanceUsd = decimalAdjustedTotalPortfolioValues.spot;

  // Total portfolio value = total cross value + sum of isolated net margins
  const portfolioValueUsd = decimalAdjustedTotalPortfolioValues.netTotal.plus(
    perpIsoMetrics.totalNetMarginUsd,
  );
  const subaccountSnapshotMetrics = indexerSnapshot
    ? getSubaccountMetricsFromIndexerSnapshot(indexerSnapshot)
    : undefined;

  return {
    accountLeverage: calcSubaccountLeverage(subaccountSummary),
    marginUsageFractionBounded: marginUsageFractions.initial,
    maintMarginUsageFractionBounded: marginUsageFractions.maintenance,
    portfolioValueUsd,
    initialMarginBoundedUsd: BigNumber.max(0, decimalAdjustedInitialMargin),
    maintMarginBoundedUsd: BigNumber.max(0, decimalAdjustedMaintMargin),
    totalUnrealizedPnlUsd: totalSpotUnrealizedPnl.plus(totalPerpUnrealizedPnl),
    totalCumulativeVolumeUsd: removeDecimals(
      subaccountSnapshotMetrics?.cumulativeTotalVolume,
    ),
    spot: {
      netCrossBalanceUsd: spotNetCrossBalanceUsd,
      netTotalBalanceUsd: spotNetCrossBalanceUsd.plus(
        perpIsoMetrics.totalNetMarginUsd,
      ),
      totalBorrowsValueUsd: removeDecimals(totalBorrowsValue),
      totalDepositsValueUsd: removeDecimals(totalDepositsValue),
      averageBorrowAPYFraction,
      averageDepositAPYFraction,
      averageAPYFraction: averageSpotAPYFraction,
      totalNetInterestCumulativeUsd: removeDecimals(
        totalNetInterestCumulativeUsd,
      ),
      totalUnrealizedPnlUsd: totalSpotUnrealizedPnl,
    },
    perp: {
      totalNotionalValueUsd: totalPerpNotionalValue,
      totalUnrealizedPnlUsd: totalPerpUnrealizedPnl,
      totalUnrealizedPnlFrac: totalPerpUnrealizedPnlFrac,
      cross: perpCrossMetrics,
      iso: perpIsoMetrics,
    },
  };
}
