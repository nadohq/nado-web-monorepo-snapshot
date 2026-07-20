import { TimeInSeconds } from '@nadohq/client';
import { useDocumentVisibility } from 'ahooks';
import { secondsToMilliseconds } from 'date-fns';
import { IChartingLibraryWidget } from 'public/charting_library';
import { useEffect, useRef } from 'react';

const TAB_HIDDEN_THRESHOLD_MS = secondsToMilliseconds(TimeInSeconds.MINUTE * 5);

interface Params {
  tvWidget: IChartingLibraryWidget | undefined;
}

/**
 * Resets the TradingView chart's cached data when the tab becomes visible
 * again after being hidden longer than {@link TAB_HIDDEN_THRESHOLD_MS}, so
 * the chart re-fetches fresh bars instead of rendering stale data.
 */
export function useResetChartOnInactivity({ tvWidget }: Params) {
  const visibility = useDocumentVisibility();
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (visibility === 'hidden') {
      hiddenAtRef.current = Date.now();
      return;
    }
    if (
      visibility === 'visible' &&
      hiddenAtRef.current &&
      Date.now() - hiddenAtRef.current > TAB_HIDDEN_THRESHOLD_MS
    ) {
      console.warn(
        '[useResetChartOnInactivity] Resetting chart data due to inactivity',
      );
      tvWidget?.resetCache();
      tvWidget?.activeChart().resetData();
    }
    hiddenAtRef.current = null;
  }, [visibility, tvWidget]);
}
