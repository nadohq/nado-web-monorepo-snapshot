import { removeDecimals } from '@nadohq/client';
import {
  getSubaccountMetricsFromIndexerSnapshot,
  IndexerSubaccountMetrics,
} from '@nadohq/react-client';
import { useQuerySubaccountIndexerSnapshots } from 'client/hooks/query/subaccount/useQuerySubaccountIndexerSnapshots';

import { isFinite } from 'lodash';
import { useMemo } from 'react';

interface Metrics {
  cumulativeAccountPnlUsd: IndexerSubaccountMetrics['cumulativeAccountPnl'];
  cumulativeTotalPerpPnlUsd: IndexerSubaccountMetrics['cumulativeTotalPerpPnl'];
  portfolioValueUsd: IndexerSubaccountMetrics['portfolioValue'];
  cumulativeTotalVolumeUsd: IndexerSubaccountMetrics['cumulativeTotalVolume'];
  cumulativeSpotVolumeUsd: IndexerSubaccountMetrics['cumulativeSpotVolume'];
  cumulativePerpVolumeUsd: IndexerSubaccountMetrics['cumulativePerpVolume'];
}

interface SubaccountTimespanMetrics {
  current: Metrics;
  deltas: Metrics;
  historical: Metrics | undefined;
}

/**
 * Subaccount metrics for the specified timespan
 * @param secondsBeforeNow Number of seconds before now to query metrics for, or nullish/Infinity for all time
 * @returns Subaccount metrics for the specified timespan
 */
export function useSubaccountTimespanMetrics(secondsBeforeNow?: number) {
  const multiQuerySecondsBeforeNow = useMemo(() => {
    if (!secondsBeforeNow || !isFinite(secondsBeforeNow)) {
      // Querying for all time, so we just need the latest snapshot
      return [0];
    }
    return [0, secondsBeforeNow];
  }, [secondsBeforeNow]);

  const { data: indexerSummaries, isLoading } =
    useQuerySubaccountIndexerSnapshots({
      secondsBeforeNow: multiQuerySecondsBeforeNow,
    });

  const mappedData = useMemo((): SubaccountTimespanMetrics | undefined => {
    if (!indexerSummaries?.length) {
      return;
    }

    // Assume that if we have only one snapshot, then we're querying for all time
    // So we just return data from the latest snapshot
    const currentSummary = indexerSummaries[0];
    const historicalSummary = indexerSummaries[1];

    const currentSummaryMetrics =
      getSubaccountMetricsFromIndexerSnapshot(currentSummary);

    // Decimal Adjusted Values
    const currentPortfolioValueUsd = removeDecimals(
      currentSummaryMetrics.portfolioValue,
    );
    const currentAccountPnl = removeDecimals(
      currentSummaryMetrics.cumulativeAccountPnl,
    );
    const currentTotalPerpPnl = removeDecimals(
      currentSummaryMetrics.cumulativeTotalPerpPnl,
    );
    const currentSpotVolumeUsd = removeDecimals(
      currentSummaryMetrics.cumulativeSpotVolume,
    );
    const currentPerpVolumeUsd = removeDecimals(
      currentSummaryMetrics.cumulativePerpVolume,
    );
    const currentTotalVolumeUsd = removeDecimals(
      currentSummaryMetrics.cumulativeTotalVolume,
    );

    const currentMetrics: Metrics = {
      portfolioValueUsd: currentPortfolioValueUsd,
      cumulativeAccountPnlUsd: currentAccountPnl,
      cumulativeTotalPerpPnlUsd: currentTotalPerpPnl,
      cumulativeTotalVolumeUsd: currentTotalVolumeUsd,
      cumulativeSpotVolumeUsd: currentSpotVolumeUsd,
      cumulativePerpVolumeUsd: currentPerpVolumeUsd,
    };

    // Don't calculate difference if all time. Return from current one.
    if (!historicalSummary) {
      return {
        current: currentMetrics,
        deltas: currentMetrics,
        historical: undefined,
      };
    }

    const historicalSummaryMetrics =
      getSubaccountMetricsFromIndexerSnapshot(historicalSummary);

    // Decimal Adjusted Values
    const historicalAccountPnl = removeDecimals(
      historicalSummaryMetrics.cumulativeAccountPnl,
    );
    const historicalTotalPerpPnl = removeDecimals(
      historicalSummaryMetrics.cumulativeTotalPerpPnl,
    );
    const historicalPortfolioValueUsd = removeDecimals(
      historicalSummaryMetrics.portfolioValue,
    );
    const historicalTotalVolumeUsd = removeDecimals(
      historicalSummaryMetrics.cumulativeTotalVolume,
    );
    const historicalSpotVolumeUsd = removeDecimals(
      historicalSummaryMetrics.cumulativeSpotVolume,
    );
    const historicalPerpVolumeUsd = removeDecimals(
      historicalSummaryMetrics.cumulativePerpVolume,
    );

    const historicalMetrics: Metrics = {
      cumulativeAccountPnlUsd: historicalAccountPnl,
      cumulativeTotalPerpPnlUsd: historicalTotalPerpPnl,
      portfolioValueUsd: historicalPortfolioValueUsd,
      cumulativeTotalVolumeUsd: historicalTotalVolumeUsd,
      cumulativeSpotVolumeUsd: historicalSpotVolumeUsd,
      cumulativePerpVolumeUsd: historicalPerpVolumeUsd,
    };

    const cumulativeAccountPnlDeltaUsd =
      currentMetrics.cumulativeAccountPnlUsd.minus(
        historicalMetrics.cumulativeAccountPnlUsd,
      );

    // Deltas
    const deltaMetrics: Metrics = {
      cumulativeAccountPnlUsd: cumulativeAccountPnlDeltaUsd,
      cumulativeTotalPerpPnlUsd: currentMetrics.cumulativeTotalPerpPnlUsd.minus(
        historicalMetrics.cumulativeTotalPerpPnlUsd,
      ),
      portfolioValueUsd: currentMetrics.portfolioValueUsd.minus(
        historicalMetrics.portfolioValueUsd,
      ),
      cumulativeTotalVolumeUsd: currentMetrics.cumulativeTotalVolumeUsd.minus(
        historicalMetrics.cumulativeTotalVolumeUsd,
      ),
      cumulativeSpotVolumeUsd: currentMetrics.cumulativeSpotVolumeUsd.minus(
        historicalMetrics.cumulativeSpotVolumeUsd,
      ),
      cumulativePerpVolumeUsd: currentMetrics.cumulativePerpVolumeUsd.minus(
        historicalMetrics.cumulativePerpVolumeUsd,
      ),
    };

    return {
      current: currentMetrics,
      historical: historicalMetrics,
      deltas: deltaMetrics,
    };
  }, [indexerSummaries]);

  return {
    data: mappedData,
    isLoading,
  };
}
