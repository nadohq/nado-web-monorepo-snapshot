import { BigNumbers, sumBigNumberBy } from '@nadohq/client';
import {
  getMarketSizeFormatSpecifier,
  safeDiv,
  SharedProductMetadata,
  SpotProductMetadata,
} from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { useSpreadBalances } from 'client/hooks/subaccount/useSpreadBalances';
import { createRowId } from 'client/utils/createRowId';
import { useMemo } from 'react';

export interface TradingSpreadTableItem extends WithDataTableRowId {
  // Uses the perp metadata for the market label (e.g. "ETH" not "wETH")
  metadata: SharedProductMetadata;
  // Spot-side metadata, used to show the correct symbol in the spot position column
  spotMetadata: SpotProductMetadata;
  // Size format specifier derived from the perp market's sizeIncrement, used for both position columns
  sizeFormatSpecifier: string;
  // Signed position amounts scaled to the basis amount
  spotAmount: BigNumber;
  perpAmount: BigNumber;
  // Financial metrics scaled by basis amount / total position size
  spotPnlUsd: BigNumber | undefined;
  perpPnlUsd: BigNumber | undefined;
  fundingUsd: BigNumber | undefined;
  interestUsd: BigNumber | undefined;
  netPnlUsd: BigNumber | undefined;
}

interface Params {
  productIds?: number[];
}

export function useTradingSpreadsTable({ productIds }: Params) {
  const { data: spreadBalances, isLoading: spreadBalancesLoading } =
    useSpreadBalances();
  const { data: marketsStaticData, isLoading: marketStaticDataLoading } =
    useAllMarketsStaticData();
  const { balances: spotBalances, isLoading: spotBalancesLoading } =
    useSpotBalances();
  const { data: perpPositions, isLoading: perpPositionsLoading } =
    usePerpPositions();

  const mappedData: TradingSpreadTableItem[] | undefined = useMemo(() => {
    if (
      !spreadBalances ||
      !spotBalances ||
      !perpPositions ||
      !marketsStaticData
    ) {
      return;
    }

    const productIdsSet = productIds ? new Set(productIds) : undefined;
    return spreadBalances
      .map((spread): TradingSpreadTableItem | undefined => {
        const marketStaticData =
          marketsStaticData.perpMarkets[spread.perpProductId];
        const spotMarketStaticData =
          marketsStaticData.spotMarkets[spread.spotProductId];

        if (!marketStaticData || !spotMarketStaticData) {
          return;
        }
        if (
          productIdsSet &&
          !productIdsSet.has(spread.perpProductId) &&
          !productIdsSet.has(spread.spotProductId)
        ) {
          return;
        }

        const basisSize = spread.basisAmount.abs();

        // Find corresponding spot and perp data for scaling
        const spotBalance = spotBalances?.find(
          (b) => b.productId === spread.spotProductId,
        );
        // Only use cross-margin perp positions for spreads
        const perpPosition = perpPositions?.find(
          (p) => p.productId === spread.perpProductId && !p.iso,
        );
        // Both should be defined at this point
        if (!spotBalance || !perpPosition) {
          return;
        }

        // Scale factor = basisSize / |totalPositionSize|
        // If the total position equals the basis (fully spread), scale = 1
        const spotTotalAmount = spotBalance.amount;
        const spotScaleFactor = safeDiv(basisSize, spotTotalAmount.abs());

        const perpTotalAmount = perpPosition.amount;
        const perpScaleFactor = safeDiv(basisSize, perpTotalAmount.abs());

        const spotPnlUsd =
          spotBalance?.estimatedPnlUsd?.multipliedBy(spotScaleFactor);
        const perpPnlUsd =
          perpPosition?.estimatedPnlUsd?.multipliedBy(perpScaleFactor);
        const fundingUsd =
          perpPosition?.netFunding?.multipliedBy(perpScaleFactor);
        const interestUsd = spotBalance?.netInterestUnrealized
          ?.multipliedBy(spotScaleFactor)
          ?.multipliedBy(spotBalance.oraclePrice);

        const netPnlComponents = [
          spotPnlUsd,
          perpPnlUsd,
          fundingUsd,
          interestUsd,
        ];
        const netPnlUsd = sumBigNumberBy(
          netPnlComponents,
          (comp) => comp ?? BigNumbers.ZERO,
        );

        return {
          rowId: createRowId(spread.spotProductId, spread.perpProductId),
          metadata: marketStaticData.metadata,
          spotMetadata: spotMarketStaticData.metadata,
          sizeFormatSpecifier: getMarketSizeFormatSpecifier({
            sizeIncrement: marketStaticData.sizeIncrement,
          }),
          spotAmount: spread.basisAmount,
          perpAmount: spread.basisAmount.multipliedBy(-1),
          spotPnlUsd,
          perpPnlUsd,
          fundingUsd,
          interestUsd,
          netPnlUsd,
        };
      })
      .filter(nonNullFilter);
  }, [
    spreadBalances,
    spotBalances,
    perpPositions,
    marketsStaticData,
    productIds,
  ]);

  return {
    data: mappedData,
    isLoading:
      spreadBalancesLoading ||
      marketStaticDataLoading ||
      spotBalancesLoading ||
      perpPositionsLoading,
  };
}
