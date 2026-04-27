import { ProductEngineType } from '@nadohq/client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { SegmentedControl } from '@nadohq/web-ui';
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
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  productId: number | undefined;
}

export function TradingChartTabs({ className, productId }: Props) {
  const { t } = useTranslation();

  const { data: market } = useMarket({ productId });

  const isPerpMarket = market?.type === ProductEngineType.PERP;
  const chartTabs = useMemo(
    () => [
      { id: 'price', name: t(($) => $.price), content: TradingViewChart },
      { id: 'depth', name: t(($) => $.depth), content: DepthChart },
      ...(isPerpMarket
        ? [
            {
              id: 'funding',
              name: t(($) => $.funding),
              content: FundingChart,
            },
          ]
        : []),
    ],
    [isPerpMarket, t],
  );

  const { selectedTabId, tabs, setSelectedTabId } = useTabs(chartTabs);

  return (
    <TabsRoot
      onValueChange={setSelectedTabId}
      value={selectedTabId}
      className={joinClassNames('flex flex-col', className)}
    >
      <TabsList className="self-start p-3">
        <SegmentedControl.Container>
          {tabs.map(({ id, name }) => (
            <TabsTrigger asChild key={id} value={id}>
              <SegmentedControl.Button
                size="xs"
                active={selectedTabId === id}
                className="w-20"
                dataTestId={`chart-tabs-trigger-${id}`}
              >
                {name}
              </SegmentedControl.Button>
            </TabsTrigger>
          ))}
        </SegmentedControl.Container>
      </TabsList>
      {tabs.map(({ id, content: Content }) => (
        // Avoiding the use of `asChild` here so we don't need to forwardRef in `Content` components
        <TabsContent value={id} key={id} className="flex-1">
          <Content productId={productId} className="h-full" />
        </TabsContent>
      ))}
    </TabsRoot>
  );
}
