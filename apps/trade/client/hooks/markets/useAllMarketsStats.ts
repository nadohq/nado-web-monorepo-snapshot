import { BigNumbers } from '@nadohq/client';
import {
  calcChangeFrac,
  calcMarketConversionPriceFromOraclePrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { useAllMarkets24hSnapshots } from 'client/hooks/markets/useAllMarkets24hSnapshots';
import { useAllProducts24hHistoricalSnapshot } from 'client/hooks/markets/useAllProducts24hHistoricalSnapshot';
import { getMarketForProductId } from 'client/hooks/query/markets/allMarketsForChainEnv/getMarketForProductId';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { get } from 'lodash';
import { useMemo } from 'react';

export interface AllMarketsStats {
  /**
   * Since beginning of time
   */
  totalCumulativeVolumeInPrimaryQuote: BigNumber;
  /**
   * By Product ID
   */
  statsByMarket: Record<number, MarketStats>;
}

interface MarketStats {
  productId: number;
  /**
   * In terms of the quote currency for the mkt (ex. wETH for mETH-wETH mkt)
   */
  pastDayVolumeInQuote: BigNumber;
  /**
   * In terms of the primary quote (UDST)
   */
  pastDayVolumeInPrimaryQuote: BigNumber;
  pastDayPriceChange: BigNumber;
  pastDayPriceChangeFrac: BigNumber;
  pastDayNumTrades: BigNumber;
  openInterestQuote: BigNumber;
}

export function useAllMarketsStats() {
  const { data: latestMarketsData } = useAllMarkets();
  const { data: marketSnapshots } = useAllMarkets24hSnapshots();
  const { data: latestMarketPrices } = useQueryAllMarketsLatestPrices();
  const { data: productSnapshots } = useAllProducts24hHistoricalSnapshot();

  const data = useMemo(() => {
    if (!latestMarketsData || !productSnapshots || !marketSnapshots) {
      return undefined;
    }

    const latestMarketSnapshotsByProductId = marketSnapshots.latest;
    const historical24hMarketSnapshotsByProductId =
      marketSnapshots.historical24h;

    let totalCumulativeVolumeInPrimaryQuote = BigNumbers.ZERO;

    const statsByMarket: Record<number, MarketStats> = {};

    Object.values(latestMarketsData.allMarkets).forEach((market) => {
      const productId = market.productId;
      const quoteProductId = market.metadata.quoteProductId;

      const quoteOraclePrice =
        getMarketForProductId(quoteProductId, latestMarketsData)?.product
          .oraclePrice ?? BigNumbers.ONE;

      // Volumes are in terms of the quote currency for the market, not in terms of the primary quote
      const earliestDailyCumulativeVolume = get(
        historical24hMarketSnapshotsByProductId?.cumulativeVolumes,
        productId,
        BigNumbers.ZERO,
      );
      const latestCumulativeVolume = get(
        latestMarketSnapshotsByProductId?.cumulativeVolumes,
        productId,
        BigNumbers.ZERO,
      );
      const pastDayVolumeInQuote = latestCumulativeVolume.minus(
        earliestDailyCumulativeVolume,
      );

      totalCumulativeVolumeInPrimaryQuote =
        totalCumulativeVolumeInPrimaryQuote.plus(
          latestCumulativeVolume.multipliedBy(quoteOraclePrice),
        );

      // Trades
      const earliestDailyCumulativeNumTrades = get(
        historical24hMarketSnapshotsByProductId?.cumulativeTrades,
        productId,
        BigNumbers.ZERO,
      );
      const latestCumulativeNumTrades = get(
        latestMarketSnapshotsByProductId?.cumulativeTrades,
        productId,
        BigNumbers.ZERO,
      );

      const pastDayNumTrades = latestCumulativeNumTrades.minus(
        earliestDailyCumulativeNumTrades,
      );

      // Price change
      const currentPrice =
        latestMarketPrices?.[productId]?.safeMidPrice ??
        calcMarketConversionPriceFromOraclePrice(
          market.product.oraclePrice,
          quoteOraclePrice,
        );
      // Default to current price to get a 0% change
      const earliestProductOraclePrice =
        productSnapshots?.[productId]?.product.oraclePrice;
      const earliestDailyPrice = earliestProductOraclePrice
        ? calcMarketConversionPriceFromOraclePrice(
            earliestProductOraclePrice,
            quoteOraclePrice,
          )
        : currentPrice;
      const pastDayPriceChange = currentPrice.minus(earliestDailyPrice);
      const pastDayPriceChangeFrac = calcChangeFrac(
        currentPrice,
        earliestDailyPrice,
      );
      const openInterestQuote = get(
        latestMarketSnapshotsByProductId?.openInterestsQuote,
        productId,
        BigNumbers.ZERO,
      );

      statsByMarket[productId] = {
        productId,
        pastDayVolumeInPrimaryQuote:
          pastDayVolumeInQuote.multipliedBy(quoteOraclePrice),
        pastDayVolumeInQuote,
        pastDayPriceChange,
        pastDayPriceChangeFrac,
        pastDayNumTrades,
        openInterestQuote,
      };
    });

    return {
      totalCumulativeVolumeInPrimaryQuote,
      statsByMarket,
    };
  }, [
    latestMarketsData,
    marketSnapshots,
    latestMarketPrices,
    productSnapshots,
  ]);

  return {
    data,
  };
}
