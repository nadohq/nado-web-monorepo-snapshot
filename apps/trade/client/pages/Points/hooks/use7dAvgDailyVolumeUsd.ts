import { BigNumbers, TimeInSeconds } from '@nadohq/client';
import { useEdgeMarketSnapshots } from '@nadohq/react-client';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { getMarketForProductId } from 'client/hooks/query/markets/allMarketsForChainEnv/getMarketForProductId';
import { first, get, last } from 'lodash';
import { useMemo } from 'react';

export function use7dAvgDailyVolumeUsd() {
  const { data: latestMarketsData } = useAllMarkets();
  const { data: snapshotsData } = useEdgeMarketSnapshots({
    granularity: TimeInSeconds.DAY * 7,
    limit: 2,
  });

  const data = useMemo(() => {
    if (!latestMarketsData || !snapshotsData) {
      return undefined;
    }

    const latest = first(snapshotsData.edge);
    const historical7d =
      snapshotsData.edge.length > 1 ? last(snapshotsData.edge) : undefined;

    if (!latest || !historical7d) {
      return undefined;
    }

    let totalVolumeInPrimaryQuote = BigNumbers.ZERO;

    Object.values(latestMarketsData.allMarkets).forEach((market) => {
      const productId = market.productId;
      const quoteProductId = market.metadata.quoteProductId;

      const quoteOraclePrice =
        getMarketForProductId(quoteProductId, latestMarketsData)?.product
          .oraclePrice ?? BigNumbers.ONE;

      const latestCumulativeVolume = get(
        latest.cumulativeVolumes,
        productId,
        BigNumbers.ZERO,
      );
      const historical7dCumulativeVolume = get(
        historical7d.cumulativeVolumes,
        productId,
        BigNumbers.ZERO,
      );

      const volumeInQuote = latestCumulativeVolume.minus(
        historical7dCumulativeVolume,
      );
      totalVolumeInPrimaryQuote = totalVolumeInPrimaryQuote.plus(
        volumeInQuote.multipliedBy(quoteOraclePrice),
      );
    });

    return totalVolumeInPrimaryQuote.dividedBy(7);
  }, [latestMarketsData, snapshotsData]);

  return { data };
}
