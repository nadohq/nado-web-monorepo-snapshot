import { useIsClient } from '@nadohq/web-common';
import { SizeClass, useSizeClass } from '@nadohq/web-ui';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { TradingViewSymbolInfo } from 'client/modules/trading/chart/config/datafeedConfig';
import { WidgetConfig } from 'client/modules/trading/chart/config/types';
import { cloneDeep } from 'lodash';
import {
  ChartingLibraryWidgetConstructor,
  ChartingLibraryWidgetOptions,
  IBasicDataFeed,
  IChartingLibraryWidget,
  Timezone,
} from 'public/charting_library';
import { RefObject, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UseTradingViewWidget {
  tvWidget: IChartingLibraryWidget | undefined;
  chartContainerRef: RefObject<HTMLDivElement | null>;
}

interface Params {
  selectedSymbolInfo: TradingViewSymbolInfo | undefined;
  datafeed: IBasicDataFeed | undefined;
  widgetConfig: WidgetConfig;
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
}: {
  symbol: string;
  datafeed: IBasicDataFeed;
  widgetConfig: WidgetConfig;
  sizeClass: SizeClass;
}): ChartingLibraryWidgetOptions {
  const options: ChartingLibraryWidgetOptions = {
    ...cloneDeep(widgetConfig.options),
    symbol: symbol,
    // Tradingview expects olsendb as the timezone, which is close to, but not the same, as IANA
    // This is good enough for most cases
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as
      | Timezone
      | undefined,
    datafeed,
  };

  // default hide drawing tools on mobile
  if (sizeClass === 'mobile') {
    options.enabled_features?.push('hide_left_toolbar_by_default');
  }

  return options;
}

export function useTradingViewWidget({
  selectedSymbolInfo,
  datafeed,
  widgetConfig,
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
      });
      const widget = new ChartWidget(options);

      console.debug('[useTradingViewWidget] Chart widget created');

      await new Promise<void>((resolve) => {
        // Hack for `onChartReady` not being called in V28.3 of the library
        // this is fixed in V29 but V29 removes position & order lines
        // https://github.com/tradingview/charting_library/issues/8889#issuecomment-2625312225
        (() => {
          const startTime = Date.now();
          const timeoutLimit = 3000;

          (function checkValue() {
            try {
              if (
                (widget as any)._innerWindow().tradingViewApi ||
                Date.now() - startTime >= timeoutLimit
              ) {
                return (widget as any)._innerWindowResolver();
              }
            } catch {}
            setTimeout(checkValue, 100);
          })();
        })();

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
    chartContainerRef,
    datafeed,
    hasLoadedInitialSymbol,
    isClient,
    selectedSymbolRef,
    sizeClass,
    t,
    widgetConfig,
  ]);

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
