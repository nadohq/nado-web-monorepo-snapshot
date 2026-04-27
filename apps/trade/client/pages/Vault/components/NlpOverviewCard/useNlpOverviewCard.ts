import { removeDecimals } from '@nadohq/client';
import { calcPnlFrac, useQueryNlpSnapshots } from '@nadohq/react-client';
import { NLP_LAUNCH_DATE_SECONDS } from '@nadohq/web-common';
import { useChartSnapshotQueryParams } from 'client/modules/charts/hooks/useChartSnapshotQueryParams';
import { ChartTimespan } from 'client/modules/charts/types';
import { calcNlpMaxDrawdown } from 'client/pages/Vault/utils/nlpCalcs';
import { first, last } from 'lodash';
import { useMemo } from 'react';

interface Params {
  timespan: ChartTimespan;
}

export function useNlpOverviewCard({ timespan }: Params) {
  // Reuse the chart query for efficiency and consistency between card and chart
  const snapshotQueryParams = useChartSnapshotQueryParams(
    timespan,
    NLP_LAUNCH_DATE_SECONDS,
  );

  const { data: nlpSnapshots, isLoading: isLoadingNlpSnapshots } =
    useQueryNlpSnapshots(snapshotQueryParams);

  const data = useMemo(() => {
    const latest = first(nlpSnapshots?.snapshots);
    const earliest = last(nlpSnapshots?.snapshots);

    if (!latest || !earliest || !nlpSnapshots?.snapshots) {
      return;
    }

    // Volume for the timespan
    const volumeUsd = removeDecimals(
      latest.cumulativeVolume.minus(earliest.cumulativeVolume),
    );

    const latestCumulativePnlUsd = removeDecimals(latest.cumulativePnl);
    const earliestCumulativePnlUsd = removeDecimals(earliest.cumulativePnl);

    // PnL for the timespan
    const pnlUsd = latestCumulativePnlUsd.minus(earliestCumulativePnlUsd);

    // PnL fraction for the timespan
    const pnlFrac = calcPnlFrac(pnlUsd, removeDecimals(earliest.tvl));

    // Maximum Drawdown for the timespan
    const maxDrawdownFrac = calcNlpMaxDrawdown(nlpSnapshots.snapshots);

    return {
      totalPnlUsd: latestCumulativePnlUsd,
      pnlUsd,
      pnlFrac,
      volumeUsd,
      maxDrawdownFrac,
    };
  }, [nlpSnapshots]);

  return {
    data,
    isLoading: isLoadingNlpSnapshots,
  };
}
