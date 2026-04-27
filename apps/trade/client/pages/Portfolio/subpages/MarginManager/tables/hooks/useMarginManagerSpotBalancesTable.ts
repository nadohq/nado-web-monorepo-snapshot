import { QUOTE_PRODUCT_ID } from '@nadohq/client';
import { getHealthWeights, SpotProductMetadata } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { getStaticMarketDataForProductId } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/getStaticMarketDataForProductId';
import { SpotStaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { MarginWeightMetrics } from 'client/pages/Portfolio/subpages/MarginManager/types';
import { useMemo } from 'react';

export interface MarginManagerSpotBalanceTableItem extends WithDataTableRowId {
  productId: number;
  metadata: SpotProductMetadata;
  balanceAmount: BigNumber;
  balanceValueUsd: BigNumber;
  initialHealth: MarginWeightMetrics;
  maintenanceHealth: MarginWeightMetrics;
}

export function useMarginManagerSpotBalancesTable() {
  const { balances: spotBalances, isLoading: spotBalancesLoading } =
    useSpotBalances();
  const { data: marketsStaticData, isLoading: marketStaticDataLoading } =
    useAllMarketsStaticData();

  const mappedData: MarginManagerSpotBalanceTableItem[] | undefined =
    useMemo(() => {
      if (!spotBalances || !marketsStaticData) {
        return;
      }

      return spotBalances
        .map((balance) => {
          const marketStaticData =
            getStaticMarketDataForProductId<SpotStaticMarketData>(
              balance.productId,
              marketsStaticData,
            );

          // return if no market static data or if it's quote product or balance amount is 0
          if (
            !marketStaticData ||
            balance.productId === QUOTE_PRODUCT_ID ||
            balance.amount.isZero()
          ) {
            return;
          }

          const healthWeights = getHealthWeights(
            balance.amount,
            marketStaticData,
          );

          return {
            productId: balance.productId,
            metadata: balance.metadata,
            balanceAmount: balance.amount,
            balanceValueUsd: balance.amount.multipliedBy(balance.oraclePrice),
            initialHealth: {
              marginUsd: balance.healthMetrics.initial,
              weight: healthWeights.initial,
            },
            maintenanceHealth: {
              marginUsd: balance.healthMetrics.maintenance,
              weight: healthWeights.maintenance,
            },
            rowId: String(balance.productId),
          };
        })
        .filter(nonNullFilter);
    }, [marketsStaticData, spotBalances]);

  return {
    balances: mappedData,
    isLoading: spotBalancesLoading || marketStaticDataLoading,
  };
}
