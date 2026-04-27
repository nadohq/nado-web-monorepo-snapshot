import { ProductEngineType } from '@nadohq/client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { ScrollShadowsContainer, SegmentedControl } from '@nadohq/web-ui';
import {
  TabsContent,
  TabsList,
  Root as TabsRoot,
  TabsTrigger,
} from '@radix-ui/react-tabs';
import { useMarket } from 'client/hooks/markets/useMarket';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { DepthChart } from 'client/modules/trading/chart/depth/DepthChart';
import { FundingChart } from 'client/modules/trading/chart/funding/FundingChart';
import { TradingViewChart } from 'client/modules/trading/chart/TradingViewChart';
import { LatestMarketTrades } from 'client/modules/trading/marketOrders/latestMarketTrades/LatestMarketTrades';
import { Orderbook } from 'client/modules/trading/marketOrders/orderbook/Orderbook';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  productId?: number;
  withChartTabs?: boolean;
}

export function MarketDataTabs({ className, productId, withChartTabs }: Props) {
  const { t } = useTranslation();
  const { data: market } = useMarket({ productId });

  const isPerpProduct = market?.type === ProductEngineType.PERP;

  const marketDataTabs = useMemo(() => {
    const defaultTabs = [
      {
        id: 'book',
        title: t(($) => $.orderbookAbbrev),
        content: <Orderbook className="h-full" productId={productId} />,
      },
      {
        id: 'trades',
        title: t(($) => $.trades),
        content: (
          <LatestMarketTrades productId={productId} className="h-full" />
        ),
      },
    ];

    return withChartTabs
      ? [
          {
            id: 'chart',
            title: t(($) => $.chart),
            content: (
              <TradingViewChart productId={productId} className="h-full" />
            ),
          },
          ...defaultTabs,
          {
            id: 'depth',
            title: t(($) => $.depth),
            content: <DepthChart productId={productId} className="h-full" />,
          },
          ...(isPerpProduct
            ? [
                {
                  id: 'funding',
                  title: t(($) => $.funding),
                  content: (
                    <FundingChart productId={productId} className="h-full" />
                  ),
                },
              ]
            : []),
        ]
      : defaultTabs;
  }, [t, productId, withChartTabs, isPerpProduct]);

  const { selectedTabId, setSelectedUntypedTabId, tabs } =
    useTabs(marketDataTabs);

  return (
    <TabsRoot
      className={joinClassNames('flex flex-col', className)}
      onValueChange={setSelectedUntypedTabId}
      value={selectedTabId}
    >
      <TabsList className="p-3">
        <ScrollShadowsContainer asChild orientation="horizontal">
          <SegmentedControl.Container className="flex gap-x-1">
            {tabs.map(({ id, title }) => {
              return (
                <TabsTrigger asChild value={id} key={id}>
                  <SegmentedControl.Button
                    size="xs"
                    active={selectedTabId === id}
                    className="flex-1"
                    dataTestId={`market-data-tabs-trigger-${id}`}
                  >
                    {title}
                  </SegmentedControl.Button>
                </TabsTrigger>
              );
            })}
          </SegmentedControl.Container>
        </ScrollShadowsContainer>
      </TabsList>
      {tabs.map(({ id, content }) => (
        // "overflow-hidden" allows the scrolling of content to be handled internally
        <TabsContent key={id} value={id} className="flex-1 overflow-hidden">
          {content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}
