import { removeDecimals } from '@nadohq/client';
import {
  AnnotatedPerpBalanceWithProduct,
  AnnotatedSpotBalanceWithProduct,
  calcSpreadBasisAmount,
  calcSpreadHealthIncrease,
  InitialMaintMetrics,
} from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useQueryHealthGroups } from 'client/hooks/query/markets/useQueryHealthGroups';
import { useQuerySubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';
import { useMemo } from 'react';

export interface SpreadBalanceItem {
  spotProductId: number;
  perpProductId: number;
  basisAmount: BigNumber;
  healthIncreaseMetrics: InitialMaintMetrics;
}

export function useSpreadBalances() {
  const { data: healthGroups, isLoading: healthGroupsLoading } =
    useQueryHealthGroups();
  const {
    data: summaryData,
    isError: summaryError,
    isLoading: summaryLoading,
  } = useQuerySubaccountSummary();

  const mappedData: SpreadBalanceItem[] | undefined = useMemo(() => {
    if (!healthGroups) {
      return;
    }

    return healthGroups?.healthGroups
      .map((healthGroup) => {
        const spotBalance = summaryData?.balances?.find(
          (balance) => balance.productId === healthGroup.spotProductId,
        ) as AnnotatedSpotBalanceWithProduct;

        const perpBalance = summaryData?.balances?.find(
          (position) => position.productId === healthGroup.perpProductId,
        ) as AnnotatedPerpBalanceWithProduct;

        if (!spotBalance || !perpBalance) {
          return;
        }

        const healthIncreaseMetrics = calcSpreadHealthIncrease(
          spotBalance,
          perpBalance,
        );

        const basisAmount = calcSpreadBasisAmount(
          spotBalance.amount,
          perpBalance.amount,
        );

        if (basisAmount.isZero()) {
          return;
        }

        return {
          spotProductId: spotBalance.productId,
          perpProductId: perpBalance.productId,
          basisAmount: removeDecimals(basisAmount),
          healthIncreaseMetrics: {
            initial: removeDecimals(healthIncreaseMetrics.initial),
            maintenance: removeDecimals(healthIncreaseMetrics.maintenance),
          },
        };
      })
      .filter(nonNullFilter);
  }, [healthGroups, summaryData?.balances]);

  return {
    data: mappedData,
    isLoading: summaryLoading || healthGroupsLoading,
    isError: summaryError,
  };
}
