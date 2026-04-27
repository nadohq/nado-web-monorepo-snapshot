import { removeDecimals } from '@nadohq/client';
import { useQueryNlpSnapshots } from '@nadohq/react-client';
import {
  joinClassNames,
  NLP_LAUNCH_DATE_SECONDS,
  WithClassnames,
} from '@nadohq/web-common';
import { SegmentedControl } from '@nadohq/web-ui';
import {
  TabsContent,
  TabsList,
  Root as TabsRoot,
  TabsTrigger,
} from '@radix-ui/react-tabs';
import { BrandLoadingWrapper } from 'client/components/BrandIconLoadingWrapper/BrandLoadingWrapper';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { TimespanSelect } from 'client/modules/charts/components/TimespanSelect';
import { useChartSnapshotQueryParams } from 'client/modules/charts/hooks/useChartSnapshotQueryParams';
import { ChartTimespan } from 'client/modules/charts/types';
import { NlpPerformancePnlChart } from 'client/pages/Vault/components/NlpOverviewCard/components/charts/NlpPerformancePnlChart';
import { NlpPerformanceTvlChart } from 'client/pages/Vault/components/NlpOverviewCard/components/charts/NlpPerformanceTvlChart';
import { NlpPerformanceChartDataItem } from 'client/pages/Vault/components/NlpOverviewCard/components/charts/types';
import { secondsToMilliseconds } from 'date-fns';
import { Dispatch, ElementType, SetStateAction, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type NlpPerformanceChartTabID = 'cumulativePnl' | 'tvl';

interface NlpPerformanceChartTab {
  id: NlpPerformanceChartTabID;
  label: string;
  ChartComponent: ElementType<{
    chartData: NlpPerformanceChartDataItem[];
    timespan: ChartTimespan;
  }>;
}

interface Props extends WithClassnames {
  selectedTimespan: ChartTimespan;
  setSelectedTimespan: Dispatch<SetStateAction<ChartTimespan>>;
}

export function NlpOverviewChart({
  className,
  selectedTimespan,
  setSelectedTimespan,
}: Props) {
  const { t } = useTranslation();

  const tabs: NlpPerformanceChartTab[] = useMemo(
    () => [
      {
        id: 'cumulativePnl',
        label: t(($) => $.pnl),
        ChartComponent: NlpPerformancePnlChart,
      },
      {
        id: 'tvl',
        label: t(($) => $.tvl),
        ChartComponent: NlpPerformanceTvlChart,
      },
    ],
    [t],
  );

  const { selectedTabId, setSelectedUntypedTabId } = useTabs(tabs);

  const snapshotQueryParams = useChartSnapshotQueryParams(
    selectedTimespan,
    NLP_LAUNCH_DATE_SECONDS,
  );
  const { data: nlpSnapshots } = useQueryNlpSnapshots(snapshotQueryParams);

  const data = useMemo<NlpPerformanceChartDataItem[] | undefined>(() => {
    return nlpSnapshots?.snapshots
      .map((snapshot) => ({
        timestampMillis: secondsToMilliseconds(snapshot.timestamp.toNumber()),
        cumulativePnlUsd: removeDecimals(snapshot.cumulativePnl).toNumber(),
        tvlUsd: removeDecimals(snapshot.tvl).toNumber(),
      }))
      .reverse();
  }, [nlpSnapshots]);

  return (
    <TabsRoot
      asChild
      onValueChange={setSelectedUntypedTabId}
      value={selectedTabId}
    >
      <div className={joinClassNames('flex flex-col gap-1', className)}>
        <div className="flex items-start justify-between">
          <TabsList>
            <SegmentedControl.Container>
              {tabs.map(({ id, label }) => (
                <TabsTrigger key={id} value={id} asChild>
                  <SegmentedControl.Button
                    size="xs"
                    className="min-w-18"
                    active={id === selectedTabId}
                  >
                    {label}
                  </SegmentedControl.Button>
                </TabsTrigger>
              ))}
            </SegmentedControl.Container>
          </TabsList>
          <TimespanSelect
            selectedTimespan={selectedTimespan}
            setSelectedTimespan={setSelectedTimespan}
          />
        </div>
        {/*Chart*/}
        {/*Setting height to prevent collapse on mobile, height needs to be specified here for chart responsive container to work*/}
        <div className={joinClassNames('h-60 min-h-60', className)}>
          <BrandLoadingWrapper
            iconSizeVariant="sm"
            isLoading={!data}
            indicatorContainerClassName="h-full"
            grayscale
          >
            {data &&
              tabs.map(({ id, ChartComponent }) => (
                <TabsContent key={id} value={id} className="h-full">
                  <ChartComponent
                    chartData={data}
                    timespan={selectedTimespan}
                  />
                </TabsContent>
              ))}
          </BrandLoadingWrapper>
        </div>
      </div>
    </TabsRoot>
  );
}
