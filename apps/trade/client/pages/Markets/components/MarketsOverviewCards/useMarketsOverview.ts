import { BigNumbers, removeDecimals } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useAllMarketsStats } from 'client/hooks/markets/useAllMarketsStats';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useMemo } from 'react';

interface MarketsOverviewData {
  totalCumulativeVolumeUsd: BigNumber;
  totalDailyVolumeUsd: BigNumber;
  totalDailyTrades: BigNumber;
  openInterestUsd: BigNumber;
  hottestMarket: StaticMarketData | undefined;
}

/**
 * Derives the markets page overview figures from already-cached query data.
 * All values are quote-denominated (USD) or counts, so no xStocks display
 * conversion is required.
 */
export function useMarketsOverview(): MarketsOverviewData | undefined {
  const { data: marketStats } = useAllMarketsStats();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  return useMemo(() => {
    if (!marketStats || !allMarketsStaticData) {
      return undefined;
    }

    const allStats = Object.values(marketStats.statsByMarket);

    const {
      totalDailyVolumeInPrimaryQuote,
      totalDailyTrades,
      totalOpenInterestQuote,
      hottestMarket,
    } = allStats.reduce(
      (acc, stats) => {
        const isHottest = stats.pastDayVolumeInPrimaryQuote.gt(
          acc.hottestMarketVolume,
        );
        return {
          totalDailyVolumeInPrimaryQuote:
            acc.totalDailyVolumeInPrimaryQuote.plus(
              stats.pastDayVolumeInPrimaryQuote,
            ),
          totalDailyTrades: acc.totalDailyTrades.plus(stats.pastDayNumTrades),
          totalOpenInterestQuote: acc.totalOpenInterestQuote.plus(
            stats.openInterestQuote,
          ),
          hottestMarketVolume: isHottest
            ? stats.pastDayVolumeInPrimaryQuote
            : acc.hottestMarketVolume,
          hottestMarket: isHottest
            ? allMarketsStaticData.allMarkets[stats.productId]
            : acc.hottestMarket,
        };
      },
      {
        totalDailyVolumeInPrimaryQuote: BigNumbers.ZERO,
        totalDailyTrades: BigNumbers.ZERO,
        totalOpenInterestQuote: BigNumbers.ZERO,
        hottestMarketVolume: BigNumbers.ZERO,
        hottestMarket: undefined as StaticMarketData | undefined,
      },
    );

    const totalDailyVolumeUsd = removeDecimals(totalDailyVolumeInPrimaryQuote);
    const openInterestUsd = removeDecimals(totalOpenInterestQuote);
    const totalCumulativeVolumeUsd = removeDecimals(
      marketStats.totalCumulativeVolumeInPrimaryQuote,
    );

    return {
      totalCumulativeVolumeUsd,
      totalDailyVolumeUsd,
      totalDailyTrades,
      openInterestUsd,
      hottestMarket,
    };
  }, [marketStats, allMarketsStaticData]);
}
