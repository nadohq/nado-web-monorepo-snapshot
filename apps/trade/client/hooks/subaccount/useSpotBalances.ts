import {
  BigNumbers,
  calcUtilizationRatio,
  isSpotBalance,
  QUOTE_PRODUCT_ID,
  removeDecimals,
} from '@nadohq/client';
import {
  AnnotatedSpotBalanceWithProduct,
  AppSubaccount,
  calcIndexerSummaryUnrealizedPnl,
  calcPnlFrac,
  calcSpotBalanceHealth,
  createQueryKey,
  InitialMaintMetrics,
  QueryDisabledError,
  REACT_QUERY_CONFIG,
  SpotProductMetadata,
  useSubaccountContext,
} from '@nadohq/react-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useSpotInterestRates } from 'client/hooks/markets/useSpotInterestRates';
import { useQuerySubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';
import { useSubaccountIndexerSnapshot } from 'client/hooks/subaccount/useSubaccountIndexerSnapshot';
import { isRoughlyZero } from 'client/utils/isRoughlyZero';

export interface SpotBalanceItem {
  metadata: SpotProductMetadata;
  productId: number;
  /**
   * Decimal adjusted balance amount
   */
  amount: BigNumber;
  amountBorrowed: BigNumber;
  amountDeposited: BigNumber;
  oraclePrice: BigNumber;
  valueUsd: BigNumber;
  healthMetrics: InitialMaintMetrics;
  depositAPY: BigNumber | undefined;
  borrowAPY: BigNumber | undefined;
  utilizationRatioFrac: BigNumber | undefined;
  estimatedPnlUsd: BigNumber | undefined;
  estimatedPnlFrac: BigNumber | undefined;
  netInterestUnrealized: BigNumber | undefined;
}

interface UseSpotBalances {
  balances: SpotBalanceItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

function spotBalancesQueryKey(
  subaccount: AppSubaccount,
  subaccountSummaryDataUpdatedAt: number,
  indexerSnapshotUpdatedAt: number,
  hasInterestRatesData: boolean,
) {
  return createQueryKey(
    'spotBalances',
    subaccount,
    subaccountSummaryDataUpdatedAt,
    indexerSnapshotUpdatedAt,
    hasInterestRatesData,
  );
}

export function useSpotBalances(): UseSpotBalances {
  const { currentSubaccount } = useSubaccountContext();

  const {
    data: summaryData,
    isError: summaryError,
    isLoading: summaryLoading,
    dataUpdatedAt,
  } = useQuerySubaccountSummary();
  const { data: spotInterestRates } = useSpotInterestRates();

  // Used for PnL calculations
  const { data: indexerSnapshot, dataUpdatedAt: indexerSnapshotUpdatedAt } =
    useSubaccountIndexerSnapshot();

  const disabled = !summaryData;

  const queryFn = () => {
    if (disabled) {
      throw new QueryDisabledError();
    }

    return summaryData.balances
      .filter(isSpotBalance)
      .map((balance): SpotBalanceItem => {
        const balanceWithProduct = balance as AnnotatedSpotBalanceWithProduct;

        const decimalAdjustedBalanceAmount = removeDecimals(
          balanceWithProduct.amount,
        );

        // Ignore dust spot balances
        const roundedBalanceAmount = (() => {
          if (isRoughlyZero(decimalAdjustedBalanceAmount)) {
            return BigNumbers.ZERO;
          }
          return decimalAdjustedBalanceAmount;
        })();

        const healthMetrics = calcSpotBalanceHealth(balanceWithProduct);
        const utilizationRatioFrac = calcUtilizationRatio(balanceWithProduct);

        const indexerSnapshotBalance = indexerSnapshot?.balances.find(
          (indexerBalance) => {
            return indexerBalance.productId === balanceWithProduct.productId;
          },
        );

        const unrealizedPnl = (() => {
          // quote product does not have meaningful uPnL
          if (balance.productId === QUOTE_PRODUCT_ID) {
            return;
          }

          // we default to zero for products without balance (never deposited)
          if (!indexerSnapshotBalance) {
            return {
              pnlUsd: BigNumbers.ZERO,
              pnlFrac: BigNumbers.ZERO,
            };
          }

          const unrealizedPnl = calcIndexerSummaryUnrealizedPnl(
            indexerSnapshotBalance,
          );

          const unrealizedPnlFrac = calcPnlFrac(
            unrealizedPnl,
            indexerSnapshotBalance.trackedVars.netEntryUnrealized,
          );

          return {
            pnlUsd: removeDecimals(unrealizedPnl),
            pnlFrac: unrealizedPnlFrac,
          };
        })();

        return {
          productId: balanceWithProduct.productId,
          oraclePrice: balance.oraclePrice,
          amount: roundedBalanceAmount,
          valueUsd: balance.oraclePrice.multipliedBy(roundedBalanceAmount),
          amountBorrowed: BigNumber.min(roundedBalanceAmount, 0),
          amountDeposited: BigNumber.max(roundedBalanceAmount, 0),
          metadata: balanceWithProduct.metadata,
          healthMetrics: {
            initial: removeDecimals(healthMetrics.initial),
            maintenance: removeDecimals(healthMetrics.maintenance),
          },
          depositAPY: spotInterestRates?.[balance.productId]?.deposit,
          borrowAPY: spotInterestRates?.[balance.productId]?.borrow,
          utilizationRatioFrac,
          estimatedPnlUsd: unrealizedPnl?.pnlUsd,
          estimatedPnlFrac: unrealizedPnl?.pnlFrac,
          netInterestUnrealized: removeDecimals(
            indexerSnapshotBalance?.trackedVars.netInterestUnrealized,
          ),
        };
      });
  };

  const {
    data: mappedData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: spotBalancesQueryKey(
      currentSubaccount,
      dataUpdatedAt,
      indexerSnapshotUpdatedAt,
      !!spotInterestRates,
    ),
    queryFn,
    // Prevents a "flash" in UI when query key changes, which occurs when subaccount overview data updates
    placeholderData: keepPreviousData,
    enabled: !disabled,
    gcTime: REACT_QUERY_CONFIG.computeQueryGcTime,
    staleTime: REACT_QUERY_CONFIG.computedQueryStaleTime,
    refetchInterval: REACT_QUERY_CONFIG.computedQueryRefetchInterval,
  });

  return {
    balances: mappedData,
    isLoading: isLoading || summaryLoading,
    isError: isError || summaryError,
  };
}
