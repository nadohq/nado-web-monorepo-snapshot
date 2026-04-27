import { ProductEngineType } from '@nadohq/client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import {
  PerpStaticMarketData,
  SpotStaticMarketData,
  StaticMarketQuoteData,
} from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { usePushTradePage } from 'client/hooks/ui/navigation/usePushTradePage';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { first } from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

interface UseOrderFormMarketSelection<TMarketType extends ProductEngineType> {
  /**
   * Currently selected market
   */
  currentMarket: StaticDataByProductType[TMarketType] | undefined;
  /**
   * Quote metadata for the current market
   */
  quoteMetadata: StaticMarketQuoteData | undefined;
}

interface StaticDataByProductType {
  [ProductEngineType.SPOT]: SpotStaticMarketData;
  [ProductEngineType.PERP]: PerpStaticMarketData;
}

/**
 * Contains the logic for the selected market in the order form. Also handles syncing the selected market with the current route
 */
export function useOrderFormMarketSelection<
  TMarketType extends ProductEngineType,
>(marketType: TMarketType): UseOrderFormMarketSelection<TMarketType> {
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const pushTradePage = usePushTradePage();
  const sanitizedSearchParamsMarketName = useMarketNameFromSearchParams();

  const availableMarketsByProductId = (
    marketType === ProductEngineType.SPOT
      ? allMarketsStaticData?.spotMarkets
      : allMarketsStaticData?.perpMarkets
  ) as Record<number, StaticDataByProductType[TMarketType]> | undefined;

  const availableMarkets = availableMarketsByProductId
    ? Object.values(availableMarketsByProductId)
    : undefined;

  const savedMarketId =
    marketType === ProductEngineType.SPOT
      ? savedUserState.trading.lastSelectedSpotMarketId
      : savedUserState.trading.lastSelectedPerpMarketId;

  const searchParamsProductId = useMemo(() => {
    return availableMarkets?.find(
      (mkt) =>
        mkt.metadata.marketName.toLowerCase() ===
        sanitizedSearchParamsMarketName?.toLowerCase(),
    )?.productId;
  }, [availableMarkets, sanitizedSearchParamsMarketName]);

  // Derive the market ID - URL takes priority, then saved market, then first available
  const marketId = useMemo(() => {
    // URL is the source of truth
    if (searchParamsProductId) {
      return searchParamsProductId;
    }
    // Fallback to saved market if it exists in available markets
    if (savedMarketId && availableMarketsByProductId?.[savedMarketId]) {
      return savedMarketId;
    }
    // Fallback to first available market
    return first(availableMarkets)?.productId;
  }, [
    searchParamsProductId,
    savedMarketId,
    availableMarketsByProductId,
    availableMarkets,
  ]);

  const currentMarket = marketId
    ? availableMarketsByProductId?.[marketId]
    : undefined;
  const quoteMetadata = marketId
    ? allMarketsStaticData?.quotes?.[marketId]
    : undefined;

  // Update URL when we're using a fallback market (no valid market in URL params)
  // This is important in chain switching, e.g. on `spot?market=kBTC/USDT`, then switch chain to Mantle where this market doesn't exist
  // We need to update the URL to reflect the new market
  useEffect(() => {
    if (
      !searchParamsProductId &&
      marketId &&
      availableMarketsByProductId?.[marketId]
    ) {
      pushTradePage({ productId: marketId });
    }
  }, [
    searchParamsProductId,
    marketId,
    availableMarketsByProductId,
    pushTradePage,
  ]);

  // Save user's market selection to localStorage
  useEffect(() => {
    if (!marketId) {
      return;
    }

    setSavedUserState((prev) => {
      const currentSavedId =
        marketType === ProductEngineType.SPOT
          ? prev.trading.lastSelectedSpotMarketId
          : prev.trading.lastSelectedPerpMarketId;

      if (currentSavedId === marketId) {
        return prev;
      }

      if (marketType === ProductEngineType.SPOT) {
        prev.trading.lastSelectedSpotMarketId = marketId;
      } else {
        prev.trading.lastSelectedPerpMarketId = marketId;
      }

      return prev;
    });
  }, [marketId, marketType, setSavedUserState]);

  return {
    currentMarket,
    quoteMetadata,
  };
}

function useMarketNameFromSearchParams() {
  const searchParams = useSearchParams();
  const marketName = searchParams.get('market');

  return marketName?.toLowerCase();
}
