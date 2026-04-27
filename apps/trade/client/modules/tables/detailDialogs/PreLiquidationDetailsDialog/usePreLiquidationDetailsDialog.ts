import { ProductEngineType, removeDecimals } from '@nadohq/client';
import {
  getHealthWeights,
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
} from '@nadohq/react-client';
import { NextImageSrc } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { getStaticMarketDataForProductId } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/getStaticMarketDataForProductId';
import {
  PerpStaticMarketData,
  SpotStaticMarketData,
} from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useQuerySubaccountIndexerSnapshotsAtTimes } from 'client/hooks/query/subaccount/useQuerySubaccountIndexerSnapshotsAtTimes';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { PreLiquidationDetailsDialogParams } from 'client/modules/tables/detailDialogs/PreLiquidationDetailsDialog/types';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { millisecondsToSeconds } from 'date-fns';
import { first } from 'lodash';
import { useMemo } from 'react';
import safeStringify from 'safe-stable-stringify';

interface PreLiquidationBalance {
  iconSrc: NextImageSrc;
  productId: number;
  productName: string;
  symbol: string;
  balanceAmount: BigNumber;
  oraclePrice: BigNumber;
  priceFormatSpecifier: string;
  marginModeType: MarginModeType;
  maintenanceWeight: BigNumber;
}

interface PreLiquidationSpotBalance extends PreLiquidationBalance {
  balanceValueUsd: BigNumber;
  isolatedPerpProduct: PerpStaticMarketData | undefined;
}

interface PreLiquidationPerpBalance extends PreLiquidationBalance {
  vQuoteBalance: BigNumber;
  sizeFormatSpecifier: string;
}

interface UsePreLiquidationDetailsDialog {
  isLoading: boolean;
  isError: boolean;
  spotBalances: PreLiquidationSpotBalance[] | undefined;
  perpBalances: PreLiquidationPerpBalance[] | undefined;
  rawJsonData: string | undefined;
}

export function usePreLiquidationDetailsDialog({
  liquidationTimestampMillis,
}: PreLiquidationDetailsDialogParams) {
  const {
    data: allMarketsStaticData,
    isLoading: isLoadingMarketData,
    isError: isMarketDataError,
  } = useAllMarketsStaticData();

  // Subtract 1 second to ensure we get the snapshot before the liquidation
  const snapshotTimestamp =
    millisecondsToSeconds(liquidationTimestampMillis) - 1;

  const {
    data: snapshots,
    isLoading,
    isError,
  } = useQuerySubaccountIndexerSnapshotsAtTimes([snapshotTimestamp]);
  const snapshot = first(snapshots);

  const balances = useMemo((): Pick<
    UsePreLiquidationDetailsDialog,
    'spotBalances' | 'perpBalances'
  > => {
    if (!snapshot || !allMarketsStaticData) {
      return {
        spotBalances: undefined,
        perpBalances: undefined,
      };
    }

    const spotBalances: PreLiquidationSpotBalance[] = [];
    const perpBalances: PreLiquidationPerpBalance[] = [];

    snapshot.balances.forEach((balance) => {
      const { productId, state, isolated, isolatedProductId } = balance;

      const marketData = getStaticMarketDataForProductId<SpotStaticMarketData>(
        productId,
        allMarketsStaticData,
      );
      if (!marketData) {
        return;
      }

      const marketMetadata = getSharedProductMetadata(marketData.metadata);
      const balanceAmount = removeDecimals(state.postBalance.amount);
      const oraclePrice = state.market.product.oraclePrice;
      const priceFormatSpecifier = getMarketPriceFormatSpecifier(
        marketData.priceIncrement,
      );

      if (balanceAmount.isZero() && state.postBalance.amount.isZero()) {
        return;
      }

      const commonBalanceProperties: PreLiquidationBalance = {
        productId,
        priceFormatSpecifier,
        productName:
          state.type === ProductEngineType.SPOT
            ? marketMetadata.symbol
            : marketData.metadata.marketName,
        symbol: marketMetadata.symbol,
        iconSrc: marketMetadata.icon.asset,
        balanceAmount,
        oraclePrice,
        marginModeType: isolated ? 'isolated' : 'cross',
        maintenanceWeight: getHealthWeights(balanceAmount, marketData)
          .maintenance,
      };

      if (state.type === ProductEngineType.SPOT) {
        const balanceValue = balanceAmount.times(oraclePrice);

        const isolatedPerpProduct = isolatedProductId
          ? allMarketsStaticData.perpMarkets[isolatedProductId]
          : undefined;

        spotBalances.push({
          ...commonBalanceProperties,
          balanceValueUsd: balanceValue,
          isolatedPerpProduct,
        });
      } else {
        perpBalances.push({
          ...commonBalanceProperties,
          vQuoteBalance: removeDecimals(state.postBalance.vQuoteBalance),
          sizeFormatSpecifier: getMarketSizeFormatSpecifier({
            sizeIncrement: marketData.sizeIncrement,
          }),
        });
      }
    });

    return {
      spotBalances,
      perpBalances,
    };
  }, [allMarketsStaticData, snapshot]);

  const rawJsonData = useMemo(() => {
    if (!snapshots) return;

    return safeStringify(snapshot, undefined, 2);
  }, [snapshot, snapshots]);

  return {
    isLoading: isLoading || isLoadingMarketData,
    isError: isError || isMarketDataError,
    rawJsonData,
    ...balances,
  };
}
