import {
  BalanceHealthContributions,
  calcPerpBalanceNotionalValue,
  calcPerpBalanceValue,
  isPerpBalance,
  removeDecimals,
  Subaccount,
} from '@nadohq/client';
import {
  AnnotatedPerpBalanceWithProduct,
  AnnotatedSpotBalanceWithProduct,
  AppSubaccount,
  calcCrossPositionMarginWithoutPnl,
  calcEstimatedLiquidationPriceFromBalance,
  calcIndexerSummaryUnrealizedPnl,
  calcIndexerUnrealizedPerpEntryCost,
  calcIsoPositionLeverage,
  calcIsoPositionNetMargin,
  calcPerpBalanceHealthWithoutPnl,
  calcPnlFrac,
  createQueryKey,
  InitialMaintMetrics,
  PerpProductMetadata,
  QueryDisabledError,
  REACT_QUERY_CONFIG,
  safeDiv,
  useSubaccountContext,
} from '@nadohq/react-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { useQuerySubaccountIsolatedPositions } from 'client/hooks/query/subaccount/isolatedPositions/useQuerySubaccountIsolatedPositions';
import { useQuerySubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';
import { useSubaccountIndexerSnapshot } from 'client/hooks/subaccount/useSubaccountIndexerSnapshot';
import { QueryState } from 'client/types/QueryState';
import { getEstimatedExitPrice } from 'client/utils/getEstimatedExitPrice';

export interface PerpPositionItemIsoData {
  /** Subaccount for the isolated position */
  subaccountName: string;
  /** Net margin that the user transferred into the isolated position, excludes settled pnl */
  netMarginTransferred: BigNumber | undefined;
  /** Total margin deposited for the isolated position, can include temporarily settled pnl */
  totalMargin: BigNumber;
  /** Total margin + unsettled quote */
  netMargin: BigNumber;
  /** Leverage for the isolated position = total notional / net margin */
  leverage: number;
}

export interface PerpPositionItem {
  metadata: PerpProductMetadata;
  productId: number;
  amount: BigNumber;
  price: {
    averageEntryPrice: BigNumber | undefined;
    /** If available, the latest oracle price from the indexer. Defaults to the "slow" oracle price in the clearinghouse state */
    fastOraclePrice: BigNumber;
    /** The estimated exit price based on orderbook prices. Bid for longs, ask for shorts. Falls back to oracle if not available. */
    estimatedExitPrice: BigNumber;
  };
  notionalValueUsd: BigNumber;
  netFunding: BigNumber | undefined;
  unsettledQuoteAmount: BigNumber;
  /** Calculated with current market prices */
  estimatedPnlUsd: BigNumber | undefined;
  estimatedPnlFrac: BigNumber | undefined;
  /** Not defined for an iso position */
  crossMarginUsedUsd: BigNumber | undefined;
  estimatedLiquidationPrice: BigNumber | null;
  /** Contribution to account margin w/o PnL for cross. Isolated subaccount health for iso. */
  healthMetrics: InitialMaintMetrics;
  /** Defined if the position is an isolated position */
  iso: PerpPositionItemIsoData | undefined;
}

function perpPositionsQueryKey(
  subaccount: AppSubaccount,
  // Update times for important queries
  // Note that this includes the latest market prices so that PnL updates are real-time
  dataUpdateTimes: number[],
  hasOraclePricesData: boolean,
) {
  return createQueryKey(
    'perpPositions',
    subaccount,
    dataUpdateTimes,
    hasOraclePricesData,
  );
}

/**
 * Common interface used for processing iso / cross positions
 */
interface PerpPositionToProcess extends AnnotatedPerpBalanceWithProduct {
  iso?: {
    subaccount: Subaccount;
    healths: BalanceHealthContributions;
    quoteBalance: AnnotatedSpotBalanceWithProduct;
  };
}

export function usePerpPositions(): QueryState<PerpPositionItem[]> {
  const { currentSubaccount } = useSubaccountContext();

  const {
    data: subaccountSummary,
    dataUpdatedAt: subaccountSummaryDataUpdatedAt,
    isLoading: isLoadingSubaccountSummary,
    isError: isSubaccountSummaryError,
  } = useQuerySubaccountSummary();
  const {
    data: isolatedPositions,
    dataUpdatedAt: isolatedPositionsDataUpdatedAt,
    isLoading: isLoadingIsolatedPositions,
    isError: isIsolatedPositionsError,
  } = useQuerySubaccountIsolatedPositions();
  const { data: latestOraclePrices } = useQueryLatestOraclePrices();
  const {
    data: latestMarketPrices,
    dataUpdatedAt: latestMarketPricesDataUpdatedAt,
  } = useQueryAllMarketsLatestPrices();

  // Used for unrealized pnl, silently fail if not available
  const { data: indexerSnapshot, dataUpdatedAt: indexerSnapshotUpdatedAt } =
    useSubaccountIndexerSnapshot();

  const disabled = !subaccountSummary || !isolatedPositions;

  const queryFn = () => {
    if (disabled) {
      throw new QueryDisabledError();
    }

    const crossPerpBalances: PerpPositionToProcess[] =
      subaccountSummary.balances.filter(
        isPerpBalance,
      ) as PerpPositionToProcess[];

    const isoPerpBalances = isolatedPositions.map(
      (isoPosition): PerpPositionToProcess => {
        return {
          ...isoPosition.baseBalance,
          iso: {
            quoteBalance: isoPosition.quoteBalance,
            subaccount: isoPosition.subaccount,
            healths: isoPosition.healths,
          },
        };
      },
    );

    return [...crossPerpBalances, ...isoPerpBalances].map(
      (position): PerpPositionItem => {
        const isIso = !!position.iso;
        const productId = position.productId;
        const metadata = position.metadata;
        const slowOraclePrice = position.oraclePrice;
        const amount = position.amount;

        const isoNetMargin = position.iso
          ? calcIsoPositionNetMargin(position, position.iso.quoteBalance)
          : undefined;
        // Find the indexer snapshot associated with the isolated perp balance - the net entry represents the margin transferred
        const isoNetMarginTransferred = (() => {
          if (!isIso || !indexerSnapshot) {
            return;
          }

          return indexerSnapshot.balances.find((indexerBalance) => {
            return (
              indexerBalance.isolatedProductId === productId &&
              indexerBalance.isolated
            );
          })?.trackedVars.netEntryUnrealized;
        })();

        const indexerSnapshotBalance = indexerSnapshot?.balances.find(
          (indexerBalance) => {
            const matchesMarginMode = indexerBalance.isolated === isIso;
            return indexerBalance.productId === productId && matchesMarginMode;
          },
        );

        const productLatestMarketPrices = latestMarketPrices?.[productId];

        const oraclePrice =
          latestOraclePrices?.[productId]?.oraclePrice ?? slowOraclePrice;

        const decimalAdjustedAmount = removeDecimals(amount);
        const decimalAdjustedNotionalValue = removeDecimals(
          calcPerpBalanceNotionalValue(position),
        );
        const decimalAdjustedUnsettledQuoteAmount = removeDecimals(
          calcPerpBalanceValue(position),
        );

        const estimatedExitPrice =
          getEstimatedExitPrice(
            amount.isPositive(),
            productLatestMarketPrices,
          ) ?? oraclePrice;

        const {
          netFunding,
          unrealizedPnl,
          unrealizedPnlFrac,
          averageEntryPrice,
        } = (() => {
          if (!indexerSnapshotBalance) {
            return {};
          }

          const indexerBalanceAmount =
            indexerSnapshotBalance.state.postBalance.amount;

          const netEntryUnrealized =
            indexerSnapshotBalance.trackedVars.netEntryUnrealized;

          const averageEntryPrice = safeDiv(
            netEntryUnrealized,
            indexerBalanceAmount,
          ).abs();

          const unrealizedPnl = calcIndexerSummaryUnrealizedPnl(
            indexerSnapshotBalance,
            estimatedExitPrice,
          );

          const unrealizedPnlFrac = (() => {
            // For isolated positions, use margin transferred as denominator - this is the "equity" in USDT0 for the position
            if (position.iso) {
              if (!isoNetMarginTransferred) {
                return;
              }
              return calcPnlFrac(unrealizedPnl, isoNetMarginTransferred);
            }

            // For cross positions, use max-leverage-based entry cost as denominator
            return calcPnlFrac(
              unrealizedPnl,
              calcIndexerUnrealizedPerpEntryCost(indexerSnapshotBalance),
            );
          })();

          return {
            netFunding: removeDecimals(
              indexerSnapshotBalance.trackedVars.netFundingUnrealized,
            ),
            unrealizedPnl: removeDecimals(unrealizedPnl),
            unrealizedPnlFrac,
            averageEntryPrice,
          };
        })();

        const healthMetrics = position.iso
          ? position.iso.healths
          : calcPerpBalanceHealthWithoutPnl(position);

        const iso: PerpPositionItemIsoData | undefined = (() => {
          if (!position.iso || !isoNetMargin) {
            return;
          }

          const totalMargin = removeDecimals(position.iso.quoteBalance.amount);
          const netMargin = removeDecimals(isoNetMargin);

          return {
            subaccountName: position.iso.subaccount.subaccountName,
            netMarginTransferred: removeDecimals(isoNetMarginTransferred),
            totalMargin,
            netMargin,
            leverage: calcIsoPositionLeverage({
              totalMargin,
              vQuoteBalance: removeDecimals(position.vQuoteBalance),
              positionNotionalValueWithSign:
                decimalAdjustedNotionalValue.multipliedBy(
                  decimalAdjustedAmount.s ?? 1,
                ),
            }).toNumber(),
          };
        })();

        const estimatedLiquidationPrice =
          calcEstimatedLiquidationPriceFromBalance(
            position,
            position.iso
              ? position.iso.healths.maintenance
              : subaccountSummary.health.maintenance.health,
          );
        const crossMarginUsedUsd = !isIso
          ? removeDecimals(calcCrossPositionMarginWithoutPnl(position))
          : undefined;

        return {
          metadata,
          netFunding,
          notionalValueUsd: decimalAdjustedNotionalValue,
          amount: decimalAdjustedAmount,
          unsettledQuoteAmount: decimalAdjustedUnsettledQuoteAmount,
          estimatedPnlUsd: unrealizedPnl,
          estimatedPnlFrac: unrealizedPnlFrac,
          productId,
          price: {
            fastOraclePrice: oraclePrice,
            averageEntryPrice,
            estimatedExitPrice,
          },
          estimatedLiquidationPrice,
          crossMarginUsedUsd,
          healthMetrics: {
            initial: removeDecimals(healthMetrics.initial),
            maintenance: removeDecimals(healthMetrics.maintenance),
          },
          iso,
        };
      },
    );
  };

  const {
    data: mappedData,
    isLoading: isLoadingPerpPositions,
    isError: isPerpPositionsError,
  } = useQuery({
    queryKey: perpPositionsQueryKey(
      currentSubaccount,
      [
        subaccountSummaryDataUpdatedAt,
        isolatedPositionsDataUpdatedAt,
        indexerSnapshotUpdatedAt,
        latestMarketPricesDataUpdatedAt,
      ],
      !!latestOraclePrices,
    ),
    queryFn,
    enabled: !disabled,
    // Prevents a "flash" in UI when query key changes, which occurs when subaccount overview data updates
    placeholderData: keepPreviousData,
    gcTime: REACT_QUERY_CONFIG.computeQueryGcTime,
    staleTime: REACT_QUERY_CONFIG.computedQueryStaleTime,
    refetchInterval: REACT_QUERY_CONFIG.computedQueryRefetchInterval,
  });

  return {
    data: mappedData,
    isLoading:
      isLoadingPerpPositions ||
      isLoadingSubaccountSummary ||
      isLoadingIsolatedPositions,
    isError:
      isPerpPositionsError ||
      isSubaccountSummaryError ||
      isIsolatedPositionsError,
  };
}
