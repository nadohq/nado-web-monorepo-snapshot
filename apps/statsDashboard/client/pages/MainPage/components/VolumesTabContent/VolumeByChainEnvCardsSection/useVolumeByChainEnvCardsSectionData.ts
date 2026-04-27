import { useEVMContext } from '@nadohq/react-client';
import { useQueryAllEdgeMarkets } from 'client/hooks/query/useQueryAllEdgeMarkets';
import { useEdgeMarketSnapshotsAtHistoricalTimes } from 'client/hooks/useEdgeMarketSnapshotsAtHistoricalTimes';
import { calcTotalDecimalAdjustedDeltas } from 'client/utils/calcTotalDecimalAdjustedDeltas';
import { calcTotalDecimalAdjustedValue } from 'client/utils/calcTotalDecimalAdjustedValue';
import { getVolumesInPrimaryQuoteByProductId } from 'client/utils/getVolumesInPrimaryQuoteByProductId';
import { useMemo } from 'react';

export function useVolumeByChainEnvCardsSectionData() {
  const { data: allEdgeMarketsData, isLoading: isLoadingAllEdgeMarketsData } =
    useQueryAllEdgeMarkets();
  const { supportedChainEnvs } = useEVMContext();
  const {
    data: marketSnapshotsAtHistoricalTimesData,
    isLoading: isLoadingMarketSnapshotsAtHistoricalTimesData,
  } = useEdgeMarketSnapshotsAtHistoricalTimes();

  const mappedData = useMemo(() => {
    return supportedChainEnvs.map((chainEnv) => {
      const edgeMarketSnapshotAtNow =
        marketSnapshotsAtHistoricalTimesData?.now[chainEnv];
      const edgeMarketSnapshotAt24h =
        marketSnapshotsAtHistoricalTimesData?.['24h'][chainEnv];

      const cumulativeVolumesAtNowUsd = getVolumesInPrimaryQuoteByProductId(
        edgeMarketSnapshotAtNow?.cumulativeVolumes,
        allEdgeMarketsData,
      );

      const cumulativeVolumesAt24hUsd = getVolumesInPrimaryQuoteByProductId(
        edgeMarketSnapshotAt24h?.cumulativeVolumes,
        allEdgeMarketsData,
      );

      const totalVolume24hUsd = calcTotalDecimalAdjustedDeltas(
        cumulativeVolumesAtNowUsd,
        cumulativeVolumesAt24hUsd,
      );

      const totalVolumeAllTimeUsd = calcTotalDecimalAdjustedValue(
        cumulativeVolumesAtNowUsd,
      );

      return {
        chainEnv,
        totalVolume24hUsd,
        totalVolumeAllTimeUsd,
      };
    });
  }, [
    allEdgeMarketsData,
    marketSnapshotsAtHistoricalTimesData,
    supportedChainEnvs,
  ]);

  return {
    data: mappedData,
    isLoading:
      isLoadingMarketSnapshotsAtHistoricalTimesData ||
      isLoadingAllEdgeMarketsData,
  };
}
