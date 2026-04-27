import { WidgetConfig } from 'client/modules/trading/chart/config/types';
import { WEB_WIDGET_CONFIG } from 'client/modules/trading/chart/config/webWidgetConfig';
import { cloneDeep } from 'lodash';

const baseOptions = cloneDeep(WEB_WIDGET_CONFIG.options);

export const MOBILE_WIDGET_CONFIG: WidgetConfig = {
  styling: WEB_WIDGET_CONFIG.styling,
  options: {
    ...baseOptions,
    fullscreen: true,
    enabled_features: [
      'iframe_loading_compatibility_mode',
      'hide_left_toolbar_by_default',
    ],
  },
};
