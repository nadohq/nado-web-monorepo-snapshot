import {
  ChainEnv,
  NLP_PRODUCT_ID,
  ProductEngineType,
  QUOTE_PRODUCT_ID,
} from '@nadohq/client';
import {
  createQueryKey,
  getPrimaryChain,
  QueryDisabledError,
  useNadoClientContext,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import {
  EdgeAnnotatedMarket,
  EdgeAnnotatedPerpMarket,
  EdgeAnnotatedSpotMarket,
} from 'client/hooks/types';

export interface AllEdgeMarketsData {
  /**
   * Registered markets from product id -> data
   */
  allMarkets: Record<number, EdgeAnnotatedMarket>;
  spotMarkets: Record<number, EdgeAnnotatedSpotMarket>;
  perpMarkets: Record<number, EdgeAnnotatedPerpMarket>;
  allMarketsProductIds: number[];
  spotMarketsProductIds: number[];
  perpMarketsProductIds: number[];
  /**
   * Primary quote requires special treatment as these share same product id between chains
   */
  primaryQuoteProductByChainEnv: Record<ChainEnv, EdgeAnnotatedSpotMarket>;
  /**
   * NLP requires special treatment as these share same product id between chains
   */
  nlpProductByChainEnv: Record<ChainEnv, EdgeAnnotatedSpotMarket>;
}

/**
 * Fetches all edge markets. Assumes that allProducts are unique per chain and only quote products need special treatment by chainEnv.
 * @returns
 */
export function useQueryAllEdgeMarkets() {
  const {
    getSpotMetadataByChainEnv,
    getPerpMetadata,
    getIsHiddenMarket,
    getIsNewMarket,
  } = useNadoMetadataContext();
  const { nadoClientsByChainEnv, primaryChainNadoClient } =
    useNadoClientContext();

  const disabled = !nadoClientsByChainEnv || !primaryChainNadoClient;

  const queryFn = async (): Promise<AllEdgeMarketsData> => {
    if (disabled) {
      throw new QueryDisabledError();
    }

    const spotMarkets: Record<number, EdgeAnnotatedSpotMarket> = {};
    const perpMarkets: Record<number, EdgeAnnotatedPerpMarket> = {};
    const primaryQuoteProductByChainEnv: Record<
      string,
      EdgeAnnotatedSpotMarket
    > = {};
    const nlpProductByChainEnv: Record<string, EdgeAnnotatedSpotMarket> = {};

    const edgeAllEngineMarketsResponse =
      await primaryChainNadoClient.client.market.getEdgeAllMarkets();

    Object.values(nadoClientsByChainEnv).forEach(({ chainEnv }) => {
      const chainId = getPrimaryChain(chainEnv).id;
      const allEngineMarketsData = edgeAllEngineMarketsResponse[chainId];

      allEngineMarketsData.forEach((market) => {
        if (market.type === ProductEngineType.SPOT) {
          const metadata = getSpotMetadataByChainEnv(
            chainEnv,
            market.product.productId,
          );
          if (!metadata) {
            return;
          }

          const annotatedSpotMarket = {
            ...market,
            // We need to have chainEnv for spot markets. So we can differentiate wETH on different chains.
            chainEnv,
            metadata,
            isHidden: getIsHiddenMarket(market.productId),
            isNew: getIsNewMarket(market.productId),
          };

          if (market.productId === QUOTE_PRODUCT_ID) {
            primaryQuoteProductByChainEnv[chainEnv] = annotatedSpotMarket;
          } else if (market.productId === NLP_PRODUCT_ID) {
            nlpProductByChainEnv[chainEnv] = annotatedSpotMarket;
          } else {
            spotMarkets[market.productId] = annotatedSpotMarket;
          }
        } else if (market.type === ProductEngineType.PERP) {
          const metadata = getPerpMetadata(market.product.productId);
          if (!metadata) {
            return;
          }

          // For example, if initial weight is 0.9, then max leverage is 1 / 0.1 = 10x
          const maxLeverage = Math.round(
            1 / (1 - market.product.longWeightInitial.toNumber()),
          );

          perpMarkets[market.productId] = {
            ...market,
            metadata,
            // Perp markets are common between all chains. So we use edge.
            chainEnv: 'edge',
            maxLeverage,
            isHidden: getIsHiddenMarket(market.productId),
            isNew: getIsNewMarket(market.productId),
          };
        }
      });
    });

    const spotMarketsProductIds = Object.keys(spotMarkets).map(Number);
    const perpMarketsProductIds = Object.keys(perpMarkets).map(Number);

    return {
      spotMarkets,
      perpMarkets,
      allMarkets: { ...spotMarkets, ...perpMarkets },
      allMarketsProductIds: [
        ...spotMarketsProductIds,
        ...perpMarketsProductIds,
      ],
      spotMarketsProductIds,
      perpMarketsProductIds,
      primaryQuoteProductByChainEnv,
      nlpProductByChainEnv,
    };
  };

  return useQuery({
    queryKey: createQueryKey('allEdgeMarkets'),
    queryFn,
    enabled: !disabled,
  });
}
