import { TradingViewSymbolInfo } from 'client/modules/trading/chart/config/datafeedConfig';
import { isChartSyncedToSymbolInfo } from 'client/modules/trading/chart/utils/isChartSyncedToSymbolInfo';
import { IChartingLibraryWidget } from 'public/charting_library';
import { useEffect } from 'react';

interface Params {
  tvWidget: IChartingLibraryWidget | undefined;
  loadedSymbolInfo: TradingViewSymbolInfo | undefined;
  drawOrderLines: () => void;
  drawPositionLines: () => void;
}

/**
 * NOTE: The previous implementation of this had some fancy logic for handling the widget being ready, but it was
 * never really bulletproof. For the sake of simplicity, we just `try/catch` all draw attempts and ignore errors.
 */
export function useDrawChartLinesWhenReady({
  tvWidget,
  loadedSymbolInfo,
  drawOrderLines,
  drawPositionLines,
}: Params) {
  const isWidgetAndSymbolReady = (() => {
    if (!tvWidget || !loadedSymbolInfo) {
      return false;
    }

    return isChartSyncedToSymbolInfo(
      tvWidget.activeChart().symbol(),
      loadedSymbolInfo,
    );
  })();

  // Draw chart lines on reload of the callback - the individual draw functions will reload on data changes, so having
  // this effect ensures that data is always brought up to date
  useEffect(() => {
    if (!isWidgetAndSymbolReady) {
      return;
    }
    try {
      drawOrderLines();
    } catch (err) {
      console.debug(
        '[useDrawChartLinesWhenReady] Failed to draw order lines',
        err,
      );
    }
  }, [drawOrderLines, isWidgetAndSymbolReady]);

  useEffect(() => {
    if (!isWidgetAndSymbolReady) {
      return;
    }
    try {
      drawPositionLines();
    } catch (err) {
      console.debug(
        '[useDrawChartLinesWhenReady] Failed to draw position lines',
        err,
      );
    }
  }, [isWidgetAndSymbolReady, drawPositionLines]);
}
