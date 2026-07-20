import { getCustomThemes } from 'client/modules/trading/chart/config/customThemes';
import { WidgetConfig } from 'client/modules/trading/chart/config/types';
import { SaveLoadAdapter } from 'client/modules/trading/chart/SaveLoadAdapter';
import type {
  LanguageCode,
  ResolutionString,
  WidgetOverrides,
} from 'public/charting_library';

export const WIDGET_CONTAINER_ID: string = 'default-chart-container';

// https://www.tradingview.com/charting-library-docs/latest/customization/overrides/chart-overrides
export function getWidgetOverrides(): Partial<WidgetOverrides> {
  return {
    'mainSeriesProperties.style': 1, // Candles = 1 by default
    'mainSeriesProperties.showCountdown': true,

    // Pane properties
    'paneProperties.backgroundType': 'solid',
    'paneProperties.vertGridProperties.style': 2, // Dashed = 2
    'paneProperties.horzGridProperties.style': 2, // Dashed = 2
    'paneProperties.topMargin': 12,
    'paneProperties.bottomMargin': 12,

    // Scale properties
    'scalesProperties.fontSize': 10,
  };
}

const WIDGET_OPTIONS: WidgetConfig['options'] = {
  library_path: '/charting_library/',
  custom_css_url: '/nado-chart-overrides.css',
  container: WIDGET_CONTAINER_ID,
  fullscreen: false,
  autosize: true,
  locale: 'en',
  theme: 'dark',
  interval: '30' as ResolutionString,
  header_widget_buttons_mode: 'fullsize',
  enabled_features: [
    'lock_visible_time_range_on_resize',
    'iframe_loading_compatibility_mode',
    'order_panel',
    'chart_crosshair_menu',
  ],
  favorites: {
    intervals: ['1', '30', '1h', '1D'] as ResolutionString[],
  },
  disabled_features: [
    'header_compare',
    'show_interval_dialog_on_key_press',
    'header_symbol_search',
    'symbol_search_hot_key',
    'symbol_info',
    'display_market_status',
    'show_right_widgets_panel_by_default',
    'show_object_tree',
    'trading_account_manager',
  ],
  save_load_adapter: new SaveLoadAdapter(), // Save/load technical analysis
  load_last_chart: true,
  auto_save_delay: 5, // In seconds, the minimum recommended is 5
};

// Built as a factory so theme colors are resolved from CSS vars at runtime rather than at module load.
export function getWidgetConfig(locale: LanguageCode): WidgetConfig {
  return {
    options: {
      ...WIDGET_OPTIONS,
      locale,
      overrides: getWidgetOverrides(),
      custom_themes: getCustomThemes(),
    },
  };
}
