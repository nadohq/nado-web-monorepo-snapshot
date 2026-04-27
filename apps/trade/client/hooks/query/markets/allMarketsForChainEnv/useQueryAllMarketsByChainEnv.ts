import {
  ChainEnv,
  GetEngineAllMarketsResponse,
  NLP_PRODUCT_ID,
  ProductEngineType,
  QUOTE_PRODUCT_ID,
} from '@nadohq/client';
import {
  AnnotatedPerpMarket,
  AnnotatedSpotMarket,
  getPrimaryChain,
  NadoMetadataContextData,
  QueryDisabledError,
  useNadoClientContext,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { AllMarketsForChainEnv } from 'client/hooks/query/markets/allMarketsForChainEnv/types';
import { useOperationTimeLogger } from 'client/hooks/util/useOperationTimeLogger';
import { get } from 'lodash';

type Data = Partial<Record<ChainEnv, AllMarketsForChainEnv>>;

export function allMarketsByChainEnvQueryKey() {
  return ['allMarketsByChainEnv'];
}

/**
 * Query hook that returns all markets for all chain envs
 */
export function useQueryAllMarketsByChainEnv() {
  const { startProfiling, endProfiling } = useOperationTimeLogger(
    'allMarketsByChainEnv',
    true,
  );
  const { nadoClientsByChainEnv, primaryChainNadoClient } =
    useNadoClientContext();
  const {
    getPerpMetadata,
    getSpotMetadataByChainEnv,
    getIsHiddenMarket,
    getIsNewMarket,
  } = useNadoMetadataContext();

  const disabled = !primaryChainNadoClient || !nadoClientsByChainEnv;

  const queryFn = async (): Promise<Data> => {
    if (disabled) {
      throw new QueryDisabledError();
    }

    startProfiling();
    const baseResponse =
      await primaryChainNadoClient.client.market.getEdgeAllMarkets();
    endProfiling();

    const allMarketsByChainEnv: Data = {};

    Object.values(nadoClientsByChainEnv).forEach((nadoClient) => {
      const primaryChainId = getPrimaryChain(nadoClient.chainEnv).id;
      const dataForChainEnv = get(baseResponse, primaryChainId, undefined);
      if (!dataForChainEnv) {
        return;
      }

      allMarketsByChainEnv[nadoClient.chainEnv] = getAllMarketsForChainEnv({
        data: dataForChainEnv,
        chainEnv: nadoClient.chainEnv,
        getSpotMetadataByChainEnv,
        getPerpMetadata,
        getIsHiddenMarket,
        getIsNewMarket,
      });
    });

    return allMarketsByChainEnv;
  };

  return useQuery({
    queryKey: allMarketsByChainEnvQueryKey(),
    queryFn,
    enabled: !disabled,
    refetchInterval: 60000,
    staleTime: 60000,
  });
}

function getAllMarketsForChainEnv({
  data,
  chainEnv,
  getSpotMetadataByChainEnv,
  getPerpMetadata,
  getIsHiddenMarket,
  getIsNewMarket,
}: {
  data: GetEngineAllMarketsResponse;
  chainEnv: ChainEnv;
  getSpotMetadataByChainEnv: NadoMetadataContextData['getSpotMetadataByChainEnv'];
  getPerpMetadata: NadoMetadataContextData['getPerpMetadata'];
  getIsHiddenMarket: NadoMetadataContextData['getIsHiddenMarket'];
  getIsNewMarket: NadoMetadataContextData['getIsNewMarket'];
}): AllMarketsForChainEnv {
  let primaryQuoteProduct: AnnotatedSpotMarket | undefined;
  let nlpProduct: AnnotatedSpotMarket | undefined;
  const spotMarkets: Record<number, AnnotatedSpotMarket> = {};
  const perpMarkets: Record<number, AnnotatedPerpMarket> = {};

  data.forEach((market) => {
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
        metadata,
        isHidden: getIsHiddenMarket(market.productId),
        isNew: getIsNewMarket(market.productId),
      };

      if (market.productId === QUOTE_PRODUCT_ID) {
        primaryQuoteProduct = annotatedSpotMarket;
      } else if (market.productId === NLP_PRODUCT_ID) {
        nlpProduct = annotatedSpotMarket;
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
        maxLeverage,
        isHidden: getIsHiddenMarket(market.productId),
        isNew: getIsNewMarket(market.productId),
      };
    }
  });

  if (primaryQuoteProduct == null) {
    throw new Error('Quote product not found');
  }

  const spotMarketsProductIds = Object.keys(spotMarkets).map(Number);
  const perpMarketsProductIds = Object.keys(perpMarkets).map(Number);

  return {
    primaryQuoteProduct,
    nlpProduct,
    spotProducts: {
      [QUOTE_PRODUCT_ID]: primaryQuoteProduct,
      ...(nlpProduct ? { [nlpProduct.productId]: nlpProduct } : {}),
      ...spotMarkets,
    },
    spotMarkets,
    perpMarkets,
    allMarkets: { ...spotMarkets, ...perpMarkets },
    allMarketsProductIds: [...spotMarketsProductIds, ...perpMarketsProductIds],
    spotMarketsProductIds,
    perpMarketsProductIds,
  };
}
