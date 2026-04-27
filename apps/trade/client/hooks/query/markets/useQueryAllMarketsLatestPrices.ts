import {
  BigNumbers,
  ChainEnv,
  EngineMarketPrice,
  removeDecimals,
} from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';

export function allLatestMarketPricesQueryKey(
  chainEnv?: ChainEnv,
  productIds?: number[],
) {
  return createQueryKey('latestMarketPrices', chainEnv, productIds);
}

export interface LatestMarketPrice {
  bid: BigNumber;
  ask: BigNumber;
  midPrice: BigNumber;
  safeBid: BigNumber | undefined;
  safeAsk: BigNumber | undefined;
  safeMidPrice: BigNumber | undefined;
}

/**
 * Product ID -> LatestMarketPrice
 */
export type AllLatestMarketPricesData = Record<number, LatestMarketPrice>;

export function useQueryAllMarketsLatestPrices() {
  const nadoClient = usePrimaryChainNadoClient();
  const { primaryChainEnv } = useEVMContext();
  const { data: allMarketsData } = useAllMarkets();

  const allProductIds = allMarketsData?.allMarketsProductIds ?? [];

  const disabled = !nadoClient || allProductIds.length === 0;

  return useQuery({
    queryKey: allLatestMarketPricesQueryKey(primaryChainEnv, allProductIds),
    queryFn: async (): Promise<AllLatestMarketPricesData> => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const { marketPrices } = await nadoClient.market.getLatestMarketPrices({
        productIds: allProductIds,
      });

      const productIdToLatestMarketPrice: AllLatestMarketPricesData = {};
      marketPrices.forEach((marketPrice) => {
        productIdToLatestMarketPrice[marketPrice.productId] =
          getLatestMarketPrice(marketPrice);
      });

      return productIdToLatestMarketPrice;
    },
    enabled: !disabled,
    refetchInterval: 2000,
  });
}

// backend defaults when the book is empty
const DEFAULT_BID_PRICE = BigNumbers.ZERO;
const DEFAULT_ASK_PRICE = removeDecimals(BigNumbers.MAX_I128);

export function getLatestMarketPrice(
  marketPrice: Partial<EngineMarketPrice>,
): LatestMarketPrice {
  const bidPrice = marketPrice.bid ?? DEFAULT_BID_PRICE;
  const askPrice = marketPrice.ask ?? DEFAULT_ASK_PRICE;
  const midPrice = bidPrice.plus(askPrice).div(2);
  const isBidEmpty = DEFAULT_BID_PRICE.eq(bidPrice);
  const isAskEmpty = DEFAULT_ASK_PRICE.eq(askPrice);

  // Safe variables will return undefined in case when ask/bid/avg of the orderbook are empty.
  const safeBid = isBidEmpty ? undefined : bidPrice;
  const safeAsk = isAskEmpty ? undefined : askPrice;

  const safeMidPrice = safeBid && safeAsk ? midPrice : undefined;

  return {
    bid: bidPrice,
    ask: askPrice,
    midPrice,
    safeAsk,
    safeMidPrice,
    safeBid,
  };
}
