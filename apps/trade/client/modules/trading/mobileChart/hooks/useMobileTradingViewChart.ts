import { useState } from 'react';

import { TradingViewSymbolInfo } from 'client/modules/trading/chart/config/datafeedConfig';
import { MOBILE_WIDGET_CONFIG } from 'client/modules/trading/chart/config/mobileWidgetConfig';
import { useApplyWidgetStyling } from 'client/modules/trading/chart/hooks/useApplyWidgetStyling';
import { useSyncWidgetSymbol } from 'client/modules/trading/chart/hooks/useSyncWidgetSymbol';
import { useTradingViewData } from 'client/modules/trading/chart/hooks/useTradingViewData/useTradingViewData';
import { useTradingViewWidget } from 'client/modules/trading/chart/hooks/useTradingViewWidget';

interface UseMobileTradingViewChartParams {
  productId: number;
}

export function useMobileTradingViewChart({
  productId,
}: UseMobileTradingViewChartParams) {
  const { datafeed, symbolInfoByProductId } = useTradingViewData();
  const [, setLoadedSymbolInfo] = useState<TradingViewSymbolInfo | undefined>();
  const selectedSymbolInfo: TradingViewSymbolInfo | undefined =
    symbolInfoByProductId && productId
      ? symbolInfoByProductId[productId]
      : undefined;

  const { tvWidget, chartContainerRef } = useTradingViewWidget({
    selectedSymbolInfo,
    datafeed,
    widgetConfig: MOBILE_WIDGET_CONFIG,
  });

  // Apply override settings/styling to the widget.
  useApplyWidgetStyling(tvWidget, MOBILE_WIDGET_CONFIG);

  // Set the selected product ticker on chart itself.
  useSyncWidgetSymbol({
    tvWidget,
    selectedSymbolInfo,
    setLoadedSymbolInfo,
  });

  return { isReady: !!tvWidget, chartContainerRef };
}
