import {
  IndexerProductSnapshot,
  ProductEngineType,
  TimeInSeconds,
} from '@nadohq/client';
import {
  FundingRates,
  getFundingRates,
  getMarketPriceFormatSpecifier,
  NumberFormatSpecifier,
  PerpProductMetadata,
  safeDiv,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useFavoritedMarkets } from 'client/hooks/markets/useFavoritedMarkets';
import { useQueryAllMarkets24hFundingRates } from 'client/hooks/query/markets/useQueryAllMarkets24hFundingRates';
import { useQueryAllProductsHistoricalSnapshots } from 'client/hooks/query/markets/useQueryAllProductsHistoricalSnapshots';
import { useQueryLatestPerpPrices } from 'client/hooks/query/markets/useQueryLatestPerpPrices';
import { SEARCH_WEIGHTS } from 'client/hooks/ui/search/consts';
import { useSearch } from 'client/hooks/ui/search/useSearch';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useFundingRatePeriod } from 'client/modules/trading/hooks/useFundingRatePeriod';
import { getFundingRateForPeriod } from 'client/pages/Markets/utils/getFundingRateForPeriod';
import { useMemo } from 'react';

export interface FundingRateTableItem extends WithDataTableRowId {
  rowId: string;
  isFavorited: boolean;
  metadata: PerpProductMetadata;
  productId: number;
  markPrice: BigNumber | undefined;
  indexPrice: BigNumber | undefined;
  periodPredictedRate: BigNumber | undefined;
  dailyAvg: BigNumber | undefined;
  threeDayAvg: BigNumber | undefined;
  weeklyAvg: BigNumber | undefined;
  monthlyAvg: BigNumber | undefined;
  isNewMarket: boolean;
  marketPriceFormatSpecifier: NumberFormatSpecifier;
}

enum FundingPeriod {
  ONE_DAY = TimeInSeconds.DAY,
  THREE_DAYS = TimeInSeconds.DAY * 3,
  ONE_WEEK = TimeInSeconds.DAY * 7,
  ONE_MONTH = TimeInSeconds.DAY * 30,
}

export function useFundingRateMarketsTable({ query }: { query: string }) {
  const { fundingRatePeriod } = useFundingRatePeriod();
  const { getIsHiddenMarket, getIsNewMarket } = useNadoMetadataContext();
  const isConnected = useIsConnected();
  const { favoritedMarketIds, toggleIsFavoritedMarket } = useFavoritedMarkets();
  const { data: allMarketData, isLoading: isAllMarketDataLoading } =
    useAllMarkets();
  const { data: latestPerpPricesData } = useQueryLatestPerpPrices();
  const { data: marketsFundingRateData } = useQueryAllMarkets24hFundingRates();
  const { data: productSnapshotsData } = useQueryAllProductsHistoricalSnapshots(
    [
      0,
      FundingPeriod.ONE_DAY,
      FundingPeriod.THREE_DAYS,
      FundingPeriod.ONE_WEEK,
      FundingPeriod.ONE_MONTH,
    ],
  );

  const perpMarkets = allMarketData?.perpMarkets;

  const fundingRateData: FundingRateTableItem[] | undefined = useMemo(() => {
    if (!perpMarkets) {
      return;
    }

    return Object.values(perpMarkets)
      .filter((market) => !getIsHiddenMarket(market.productId))
      .map((market) => {
        const productId = market.productId;
        const oraclePrice = market.product.oraclePrice;
        const latestPerpPrices = latestPerpPricesData?.[productId];
        const dailyFundingRate =
          marketsFundingRateData?.[productId]?.fundingRate;

        const latestCumulativeFunding = (() => {
          const latestProductSnapshot =
            productSnapshotsData?.[0]?.[productId]?.product;

          if (latestProductSnapshot?.type === ProductEngineType.PERP) {
            return latestProductSnapshot.cumulativeFundingLong;
          }
        })();

        const dailyAvg = getHistoricalAvgFundingRates(
          productSnapshotsData?.[1],
          latestCumulativeFunding,
          oraclePrice,
          productId,
          FundingPeriod.ONE_DAY,
        );
        const threeDayAvg = getHistoricalAvgFundingRates(
          productSnapshotsData?.[2],
          latestCumulativeFunding,
          oraclePrice,
          productId,
          FundingPeriod.THREE_DAYS,
        );
        const weeklyAvg = getHistoricalAvgFundingRates(
          productSnapshotsData?.[3],
          latestCumulativeFunding,
          oraclePrice,
          productId,
          FundingPeriod.ONE_WEEK,
        );
        const monthlyAvg = getHistoricalAvgFundingRates(
          productSnapshotsData?.[4],
          latestCumulativeFunding,
          oraclePrice,
          productId,
          FundingPeriod.ONE_MONTH,
        );

        const periodPredictedRates = dailyFundingRate
          ? getFundingRates(dailyFundingRate)
          : undefined;

        return {
          rowId: String(productId),
          isFavorited: favoritedMarketIds.has(productId),
          metadata: market.metadata,
          productId: market.productId,
          indexPrice: latestPerpPrices?.indexPrice,
          markPrice: latestPerpPrices?.markPrice,
          periodPredictedRate: getFundingRateForPeriod(
            periodPredictedRates,
            fundingRatePeriod,
          ),
          dailyAvg: getFundingRateForPeriod(dailyAvg, fundingRatePeriod),
          threeDayAvg: getFundingRateForPeriod(threeDayAvg, fundingRatePeriod),
          weeklyAvg: getFundingRateForPeriod(weeklyAvg, fundingRatePeriod),
          monthlyAvg: getFundingRateForPeriod(monthlyAvg, fundingRatePeriod),
          isNewMarket: getIsNewMarket(productId),
          marketPriceFormatSpecifier: getMarketPriceFormatSpecifier({
            priceIncrement: market.priceIncrement,
            exchangeRate: undefined,
          }),
        };
      });
  }, [
    latestPerpPricesData,
    marketsFundingRateData,
    perpMarkets,
    getIsHiddenMarket,
    getIsNewMarket,
    favoritedMarketIds,
    productSnapshotsData,
    fundingRatePeriod,
  ]);

  const { results } = useSearch({
    query,
    config: {
      items: fundingRateData,
      searchKeys: [
        { name: 'metadata.marketName', weight: SEARCH_WEIGHTS.HIGH },
        { name: 'metadata.symbol', weight: SEARCH_WEIGHTS.HIGH },
        { name: 'metadata.altSearchTerms', weight: SEARCH_WEIGHTS.MEDIUM },
      ],
    },
  });

  return {
    isLoading: isAllMarketDataLoading,
    fundingRateData: results,
    toggleIsFavoritedMarket,
    disableFavoriteButton: !isConnected,
  };
}

function getHistoricalAvgFundingRates(
  productSnapshotData: Record<number, IndexerProductSnapshot> | undefined,
  latestCumulativeFunding: BigNumber | undefined,
  oraclePrice: BigNumber,
  productId: number,
  period: FundingPeriod,
): FundingRates | undefined {
  const product = productSnapshotData?.[productId]?.product;

  if (product?.type !== ProductEngineType.PERP || !latestCumulativeFunding) {
    return;
  }

  const fundingDiff = latestCumulativeFunding.minus(
    product.cumulativeFundingLong,
  );

  const fundingRateOverPeriod = safeDiv(fundingDiff, oraclePrice);

  return getFundingRates(
    fundingRateOverPeriod.multipliedBy(TimeInSeconds.DAY / period),
  );
}
