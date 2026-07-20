import { useIsClient } from '@nadohq/web-common';
import { SizeClass, useSizeClass } from '@nadohq/web-ui';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { BROKER_CONFIG } from 'client/modules/trading/chart/broker/brokerConfig';
import { NadoBroker } from 'client/modules/trading/chart/broker/NadoBroker';
import { TradingViewSymbolInfo } from 'client/modules/trading/chart/config/datafeedConfig';
import { WidgetConfig } from 'client/modules/trading/chart/config/types';
import {
  NadoBrokerDeps,
  TradingViewDataFeed,
} from 'client/modules/trading/chart/types';
import { cloneDeep } from 'lodash';
import {
  ChartingLibraryWidgetConstructor,
  IChartingLibraryWidget,
  Timezone,
  TradingTerminalWidgetOptions,
} from 'public/charting_library';
import { RefObject, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UseTradingViewWidget {
  tvWidget: IChartingLibraryWidget | undefined;
  chartContainerRef: RefObject<HTMLDivElement | null>;
}

interface Params {
  selectedSymbolInfo: TradingViewSymbolInfo | undefined;
  datafeed: TradingViewDataFeed | undefined;
  widgetConfig: WidgetConfig;
  brokerDepsRef: RefObject<NadoBrokerDeps>;
}

// Cached import for the TV charting library widget
let _widgetConstructor: ChartingLibraryWidgetConstructor | undefined;

async function getImportedWidgetConstructor() {
  if (_widgetConstructor) {
    return _widgetConstructor;
  }
  const constructor = (await import('public/charting_library')).widget;
  _widgetConstructor = constructor;
  return constructor;
}

function getWidgetOptions({
  symbol,
  datafeed,
  widgetConfig,
  sizeClass,
  brokerDepsRef,
}: {
  symbol: string;
  datafeed: TradingViewDataFeed;
  widgetConfig: WidgetConfig;
  sizeClass: SizeClass;
  brokerDepsRef: RefObject<NadoBrokerDeps>;
}): TradingTerminalWidgetOptions {
  const options: TradingTerminalWidgetOptions = {
    ...cloneDeep(widgetConfig.options),
    symbol: symbol,
    // Tradingview expects olsendb as the timezone, which is close to, but not the same, as IANA
    // This is good enough for most cases
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as
      | Timezone
      | undefined,
    datafeed,
    // Wire the broker so the Order Panel and Buy/Sell buttons can place
    // orders. Order/position lines remain hand-drawn (see useTradingViewChart).
    // broker_factory fires once per widget; the broker holds no resources
    // of its own, so its lifetime is just the widget's — when TV calls
    // widget.remove() the broker becomes unreachable and is GC'd.
    broker_factory: (host) => new NadoBroker(host, brokerDepsRef),
    broker_config: BROKER_CONFIG,
  };

  // Mobile-only overrides: hide drawing tools by default, and hide the
  // Buy/Sell legend buttons (desktop-only UX).
  if (sizeClass === 'mobile') {
    options.enabled_features?.push('hide_left_toolbar_by_default');

    options.disabled_features?.push('buy_sell_buttons');
  }

  return options;
}

export function useTradingViewWidget({
  selectedSymbolInfo,
  datafeed,
  widgetConfig,
  brokerDepsRef,
}: Params): UseTradingViewWidget {
  const { t } = useTranslation();

  const isClient = useIsClient();
  const { value: sizeClass } = useSizeClass();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState<boolean>();
  const [tvWidget, setTvWidget] = useState<IChartingLibraryWidget>();

  // Use synced refs as we don't want to reload the widget on changes of the symbol - we have a listener to switch symbols when needed
  const selectedSymbolRef = useSyncedRef(selectedSymbolInfo);
  // However, we want to trigger a load when we've first loaded the symbol, this is required for creation of the widget
  const hasLoadedInitialSymbol = !!tvWidget || !!selectedSymbolInfo;

  useEffect(() => {
    const initialTicker = selectedSymbolRef.current?.ticker;
    if (
      !chartContainerRef.current ||
      !hasLoadedInitialSymbol ||
      !datafeed ||
      !initialTicker ||
      !isClient
    ) {
      return;
    }

    // Create an async fn to call for better readability
    const createWidget = async () => {
      const ChartWidget = await getImportedWidgetConstructor();

      const options = getWidgetOptions({
        symbol: selectedSymbolRef.current?.ticker ?? initialTicker,
        datafeed,
        widgetConfig,
        sizeClass,
        brokerDepsRef,
      });

      const widget = new ChartWidget(options);

      console.debug('[useTradingViewWidget] Chart widget created');

      await new Promise<void>((resolve) => {
        widget.onChartReady(() => {
          resolve();
        });
      });

      // Listen to save requests & call save on the save load adapter
      widget.subscribe('onAutoSaveNeeded', () => {
        widget?.saveChartToServer(undefined, undefined, {
          defaultChartName: t(($) => $.defaultChartName),
        });
      });

      return widget;
    };

    let isCancelled = false;
    setIsReady(false);
    console.debug('[useTradingViewWidget] Creating chart widget');

    createWidget().then((widget) => {
      if (isCancelled) {
        return;
      }
      setTvWidget(widget);
      setIsReady(true);
    });

    return () => {
      isCancelled = true;
    };
  }, [
    brokerDepsRef,
    chartContainerRef,
    datafeed,
    hasLoadedInitialSymbol,
    isClient,
    selectedSymbolRef,
    sizeClass,
    t,
    widgetConfig,
  ]);

  // When tvWidget changes, dispose the previous widget. The associated
  // broker is owned by the widget and gets dropped along with it.
  const prevWidgetRef = useRef<IChartingLibraryWidget | undefined>(null);
  useEffect(() => {
    if (prevWidgetRef.current !== tvWidget) {
      prevWidgetRef.current?.remove();
      prevWidgetRef.current = tvWidget;
    }
  }, [tvWidget]);

  return {
    tvWidget: isReady ? tvWidget : undefined,
    chartContainerRef,
  };
}
