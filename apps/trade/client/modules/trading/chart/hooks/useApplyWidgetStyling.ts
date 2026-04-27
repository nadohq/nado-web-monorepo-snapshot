import { WidgetConfig } from 'client/modules/trading/chart/config/types';
import { IChartingLibraryWidget } from 'public/charting_library';
import { useEffect } from 'react';

export function useApplyWidgetStyling(
  tvWidget: IChartingLibraryWidget | undefined,
  widgetConfig: WidgetConfig,
) {
  useEffect(() => {
    if (!tvWidget) {
      return;
    }

    Object.entries(widgetConfig.styling).forEach(([property, color]) => {
      tvWidget.setCSSCustomProperty(property, color);
    });

    console.debug('[useApplyWidgetOverrides] Styling applied to chart');
  }, [tvWidget, widgetConfig]);
}
