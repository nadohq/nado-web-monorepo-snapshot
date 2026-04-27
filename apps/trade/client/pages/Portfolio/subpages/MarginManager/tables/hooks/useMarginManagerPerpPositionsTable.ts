import { ProductEngineType } from '@nadohq/client';
import { getHealthWeights, useNadoMetadataContext } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import { MarketInfoCellData } from 'client/modules/tables/types/MarketInfoCellData';
import { MarginWeightMetrics } from 'client/pages/Portfolio/subpages/MarginManager/types';
import { createRowId } from 'client/utils/createRowId';
import { partition } from 'lodash';
import { useMemo } from 'react';

interface IsolatedMarginMetrics {
  marginUsd: BigNumber;
  leverage: number;
  subaccountName: string;
}

interface BaseMarginManagerPerpPositionsTableItem extends WithDataTableRowId {
  productId: number;
  marketInfo: MarketInfoCellData;
  estimatedPnlUsd: BigNumber | undefined;
  unsettledQuoteAmount: BigNumber;
  notionalValueUsd: BigNumber;
  positionAmount: BigNumber;
  initialHealth: MarginWeightMetrics;
  maintenanceHealth: MarginWeightMetrics;
}

export interface MarginManagerCrossPositionsTableItem extends BaseMarginManagerPerpPositionsTableItem {
  iso: undefined;
}

export interface MarginManagerIsolatedPositionsTableItem extends BaseMarginManagerPerpPositionsTableItem {
  iso: IsolatedMarginMetrics;
}

export type MarginManagerPerpPositionsTableItem =
  | MarginManagerCrossPositionsTableItem
  | MarginManagerIsolatedPositionsTableItem;

export function useMarginManagerPerpPositionsTable() {
  const { data: perpBalances, isLoading: perpBalancesLoading } =
    usePerpPositions();
  const { data: marketsStaticData, isLoading: marketsStaticDataLoading } =
    useAllMarketsStaticData();
  const {
    primaryQuoteToken: { symbol: primaryQuoteSymbol },
  } = useNadoMetadataContext();

  const mappedData: MarginManagerPerpPositionsTableItem[] | undefined =
    useMemo(() => {
      if (!perpBalances || !marketsStaticData) {
        return;
      }

      return perpBalances
        .map((position): MarginManagerPerpPositionsTableItem | undefined => {
          const perpMarketData =
            marketsStaticData.perpMarkets[position.productId];

          // return if no market data or position amount is zero
          if (!perpMarketData || position.amount.isZero()) {
            return;
          }

          const healthWeights = getHealthWeights(
            position.amount,
            perpMarketData,
          );

          return {
            productId: position.productId,
            rowId: createRowId(
              position.productId,
              position.iso?.subaccountName ?? 'cross',
            ),
            marketInfo: {
              ...position.metadata,
              // Perps are always quoted in the primary quote token
              quoteSymbol: primaryQuoteSymbol,
              isPrimaryQuote: true,
              amountForSide: position.amount,
              productType: ProductEngineType.PERP,
              priceIncrement: perpMarketData.priceIncrement,
              sizeIncrement: perpMarketData.sizeIncrement,
            },
            positionAmount: position.amount,
            estimatedPnlUsd: position.estimatedPnlUsd,
            unsettledQuoteAmount: position.unsettledQuoteAmount,
            notionalValueUsd: position.notionalValueUsd,
            initialHealth: {
              marginUsd: position.healthMetrics.initial,
              weight: healthWeights.initial,
            },
            maintenanceHealth: {
              marginUsd: position.healthMetrics.maintenance,
              weight: healthWeights.maintenance,
            },
            iso: position.iso
              ? {
                  marginUsd: position.iso.netMargin,
                  leverage: position.iso.leverage,
                  subaccountName: position.iso.subaccountName,
                }
              : undefined,
          };
        })
        .filter(nonNullFilter);
    }, [marketsStaticData, perpBalances, primaryQuoteSymbol]);

  const [isolatedMargin, crossMargin] = useMemo(() => {
    return partition(mappedData, (position) => position.iso) as [
      MarginManagerIsolatedPositionsTableItem[],
      MarginManagerCrossPositionsTableItem[],
    ];
  }, [mappedData]);

  return {
    positions: {
      crossMargin,
      isolatedMargin,
    },
    isLoading: perpBalancesLoading || marketsStaticDataLoading,
  };
}
