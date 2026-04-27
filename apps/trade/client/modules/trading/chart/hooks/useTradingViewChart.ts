import { TradingViewSymbolInfo } from 'client/modules/trading/chart/config/datafeedConfig';
import { WEB_WIDGET_CONFIG } from 'client/modules/trading/chart/config/webWidgetConfig';
import { useApplyWidgetStyling } from 'client/modules/trading/chart/hooks/useApplyWidgetStyling';
import { useDrawChartLinesWhenReady } from 'client/modules/trading/chart/hooks/useDrawChartLinesWhenReady';
import { useDrawChartOrderLines } from 'client/modules/trading/chart/hooks/useDrawChartOrderLines';
import { useDrawChartPositionLines } from 'client/modules/trading/chart/hooks/useDrawChartPositionLines';
import { useRefreshTradeMarks } from 'client/modules/trading/chart/hooks/useRefreshTradeMarks';
import { useSyncWidgetSymbol } from 'client/modules/trading/chart/hooks/useSyncWidgetSymbol';
import { useTradingViewData } from 'client/modules/trading/chart/hooks/useTradingViewData/useTradingViewData';
import { useTradingViewWidget } from 'client/modules/trading/chart/hooks/useTradingViewWidget';
import { useUpdatePriceOnCrosshairClick } from 'client/modules/trading/chart/hooks/useUpdatePriceOnCrosshairClick';
import { RefObject, useState } from 'react';

interface UseTradingViewChart {
  isReady: boolean;
  chartContainerRef: RefObject<HTMLDivElement | null>;
}

export function useTradingViewChart(productId?: number): UseTradingViewChart {
  const { datafeed, symbolInfoByProductId } = useTradingViewData();

  const selectedSymbolInfo =
    symbolInfoByProductId && productId
      ? symbolInfoByProductId[productId]
      : undefined;

  const { tvWidget, chartContainerRef } = useTradingViewWidget({
    selectedSymbolInfo,
    datafeed,
    widgetConfig: WEB_WIDGET_CONFIG,
  });

  // Updates the order form price when the crosshair on the widget
  useUpdatePriceOnCrosshairClick({ tvWidget });

  // Apply override settings/styling to the widget
  useApplyWidgetStyling(tvWidget, WEB_WIDGET_CONFIG);

  // Refresh trade marks when needed (subaccount change, new fill event, nado client change)
  useRefreshTradeMarks({ tvWidget, productId });

  // loadedSymbolInfo is set once selectedSymbolInfo is loaded on the widget
  const [loadedSymbolInfo, setLoadedSymbolInfo] = useState<
    TradingViewSymbolInfo | undefined
  >();

  // Set the selected product ticker on chart itself, set loadedSymbolInfo once it is loaded/sync
  useSyncWidgetSymbol({
    tvWidget,
    selectedSymbolInfo,
    setLoadedSymbolInfo,
  });

  // Add order lines to the chart
  const drawOrderLines = useDrawChartOrderLines({
    tvWidget,
    loadedSymbolInfo,
  });

  // Add position lines (entry + liquidation) to the chart
  const drawPositionLines = useDrawChartPositionLines({
    tvWidget,
    loadedSymbolInfo,
  });

  // Draw lines on the chart when the widget is ready
  useDrawChartLinesWhenReady({
    tvWidget,
    loadedSymbolInfo,
    drawOrderLines,
    drawPositionLines,
  });

  return { isReady: !!tvWidget, chartContainerRef };
}
