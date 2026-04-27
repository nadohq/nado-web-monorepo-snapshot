import {
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useDebounceEffect } from 'ahooks';
import { usePaginatedSubaccountHistoricalTrades } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalTrades';
import { useEnableChartMarks } from 'client/modules/trading/hooks/useEnableChartMarks';
import { isEqual } from 'lodash';
import {
  ClearMarksMode,
  IChartingLibraryWidget,
} from 'public/charting_library';
import { useRef } from 'react';

interface Params {
  tvWidget: IChartingLibraryWidget | undefined;
  productId: number | undefined;
}

const REFRESH_MARKS_DEBOUNCE_DELAY = 500;

/**
 * Refreshes trade marks on the TradingView chart when:
 * - The subaccount changes (clears and refreshes)
 * - A new fill event occurs (refreshes only)
 * - The nado client changes (clears and refreshes)
 */
export function useRefreshTradeMarks({ tvWidget, productId }: Params) {
  const { currentSubaccount } = useSubaccountContext();
  const nadoClient = usePrimaryChainNadoClient();
  const { enableChartMarks } = useEnableChartMarks();

  // Listen to historical trades query which is updated via WebSocket
  const { data } = usePaginatedSubaccountHistoricalTrades({
    pageSize: 1,
    productIds: productId ? [productId] : undefined,
  });

  // Track last processed values to determine what changed
  const lastProcessedRef = useRef({
    currentSubaccount,
    nadoClient,
    data,
    enableChartMarks,
  });

  // useDebounceEffect: each dep change resets the timer. After 500ms of stability,
  // the effect runs once with current values. Comparison against lastProcessedRef
  // detects ALL changes that occurred, with subaccount changes taking precedence.
  useDebounceEffect(
    () => {
      if (!tvWidget) return;

      const prev = lastProcessedRef.current;
      const subaccountChanged = !isEqual(
        prev.currentSubaccount,
        currentSubaccount,
      );
      const nadoClientChanged = !isEqual(prev.nadoClient, nadoClient);
      const dataChanged = !isEqual(prev.data, data);
      const enabledChanged = prev.enableChartMarks !== enableChartMarks;
      const marksToggledOn = enabledChanged && enableChartMarks;

      lastProcessedRef.current = {
        currentSubaccount,
        nadoClient,
        data,
        enableChartMarks,
      };

      try {
        if (!enableChartMarks) {
          // Clear marks if disabled
          tvWidget.activeChart().clearMarks(ClearMarksMode.BarMarks);
        } else if (subaccountChanged || nadoClientChanged) {
          // Clear stale marks then refresh for new subaccount/client
          tvWidget.activeChart().clearMarks(ClearMarksMode.BarMarks);
          tvWidget.activeChart().refreshMarks();
        } else if (dataChanged || marksToggledOn) {
          // Refresh to add new fill marks if toggled on or when data changes
          tvWidget.activeChart().refreshMarks();
        }
      } catch (error) {
        console.error(
          '[useRefreshTradeMarks] Error refreshing trade marks',
          error,
        );
      }
    },
    [tvWidget, currentSubaccount, nadoClient, data, enableChartMarks],
    { wait: REFRESH_MARKS_DEBOUNCE_DELAY },
  );
}
