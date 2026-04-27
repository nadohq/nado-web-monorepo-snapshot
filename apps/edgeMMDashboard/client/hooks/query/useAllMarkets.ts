import {
  ChainEnv,
  NLP_PRODUCT_ID,
  ProductEngineType,
  QUOTE_PRODUCT_ID,
} from '@nadohq/client';
import {
  AnnotatedMarket,
  AnnotatedPerpMarket,
  AnnotatedSpotMarket,
  QueryDisabledError,
  useEVMContext,
  useNadoMetadataContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';

export type AllMarketsSelectFn<TSelectedData> = (
  data: AllMarketsData,
) => TSelectedData;

interface AllMarketsParams<TSelectedData> {
  select?: AllMarketsSelectFn<TSelectedData>;
}

export interface AllMarketsData {
  /**
   * This is a market for typing purposes but only the product is relevant
   */
  primaryQuoteProduct: AnnotatedSpotMarket;
  /**
   * This is also a market for typing purposes only, but only the product is relevant because NLP does not have a spot market
   */
  nlpProduct: AnnotatedSpotMarket | undefined;
  /**
   * Registered markets from product id -> data
   */
  allMarkets: Record<number, AnnotatedMarket>;
  spotMarkets: Record<number, AnnotatedSpotMarket>;
  perpMarkets: Record<number, AnnotatedPerpMarket>;
  allMarketsProductIds: number[];
  spotMarketsProductIds: number[];
  perpMarketsProductIds: number[];
}

export function allMarketsQueryKey(chainEnv?: ChainEnv) {
  return ['allMarkets', chainEnv];
}

export function useAllMarkets<TSelectedData = AllMarketsData>(
  params?: AllMarketsParams<TSelectedData>,
) {
  const nadoClient = usePrimaryChainNadoClient();
  const {
    getPerpMetadata,
    getSpotMetadata,
    getIsHiddenMarket,
    getIsNewMarket,
  } = useNadoMetadataContext();
  const { primaryChainEnv } = useEVMContext();

  const disabled = !nadoClient;

  const queryFn = async (): Promise<AllMarketsData> => {
    if (disabled) {
      throw new QueryDisabledError();
    }

    const baseResponse = await nadoClient.market.getAllMarkets();

    let primaryQuoteProduct: AnnotatedSpotMarket | undefined;
    let nlpProduct: AnnotatedSpotMarket | undefined;
    const spotMarkets: Record<number, AnnotatedSpotMarket> = {};
    const perpMarkets: Record<number, AnnotatedPerpMarket> = {};

    baseResponse.forEach((market) => {
      if (market.type === ProductEngineType.SPOT) {
        const metadata = getSpotMetadata(market.product.productId);

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
      spotMarkets,
      perpMarkets,
      allMarkets: { ...spotMarkets, ...perpMarkets },
      allMarketsProductIds: [
        ...spotMarketsProductIds,
        ...perpMarketsProductIds,
      ],
      spotMarketsProductIds,
      perpMarketsProductIds,
    };
  };

  return useQuery({
    queryKey: allMarketsQueryKey(primaryChainEnv),
    queryFn,
    enabled: !disabled,
    refetchInterval: 60000,
    select: params?.select,
  });
}
