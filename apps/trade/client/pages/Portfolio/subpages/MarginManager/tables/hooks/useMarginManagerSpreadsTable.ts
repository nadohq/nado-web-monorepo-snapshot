import {
  getHealthWeights,
  getMarketSizeFormatSpecifier,
  SharedProductMetadata,
} from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useSpreadBalances } from 'client/hooks/subaccount/useSpreadBalances';
import { MarginWeightMetrics } from 'client/pages/Portfolio/subpages/MarginManager/types';
import { useMemo } from 'react';

export interface MarginManagerSpreadTableItem extends WithDataTableRowId {
  spotProductId: number;
  perpProductId: number;
  // Uses the perp metadata. For something like the ETH-PERP & wETH spread, we want ETH as the symbol, not wETH
  metadata: SharedProductMetadata;
  // Size format specifier derived from the perp market's sizeIncrement
  sizeFormatSpecifier: string;
  spreadSize: BigNumber;
  spotSpreadAmount: BigNumber;
  perpSpreadAmount: BigNumber;
  initialHealthBenefit: MarginWeightMetrics;
  maintenanceHealthBenefit: MarginWeightMetrics;
}

export function useMarginManagerSpreadsTable() {
  const { data: spreadBalances, isLoading: spreadBalancesLoading } =
    useSpreadBalances();
  const { data: marketsStaticData, isLoading: marketStaticDataLoading } =
    useAllMarketsStaticData();

  const mappedData: MarginManagerSpreadTableItem[] | undefined = useMemo(() => {
    if (!spreadBalances || !marketsStaticData) {
      return;
    }

    return spreadBalances
      .map((spread): MarginManagerSpreadTableItem | undefined => {
        const marketStaticData =
          marketsStaticData?.perpMarkets[spread.perpProductId];

        // return if no market static data
        if (!marketStaticData) {
          return;
        }

        const spreadSize = spread.basisAmount.abs();

        const healthWeights = getHealthWeights(spreadSize, marketStaticData);

        return {
          spotProductId: spread.spotProductId,
          perpProductId: spread.perpProductId,
          metadata: marketStaticData.metadata,
          sizeFormatSpecifier: getMarketSizeFormatSpecifier({
            sizeIncrement: marketStaticData.sizeIncrement,
          }),
          spreadSize,
          spotSpreadAmount: spread.basisAmount,
          perpSpreadAmount: spread.basisAmount.multipliedBy(-1),
          initialHealthBenefit: {
            marginUsd: spread.healthIncreaseMetrics.initial,
            weight: healthWeights.initial,
          },
          maintenanceHealthBenefit: {
            marginUsd: spread.healthIncreaseMetrics.maintenance,
            weight: healthWeights.maintenance,
          },
          rowId: String(spread.perpProductId),
        };
      })
      .filter(nonNullFilter);
  }, [marketsStaticData, spreadBalances]);

  return {
    data: mappedData,
    isLoading: spreadBalancesLoading || marketStaticDataLoading,
  };
}
