import { NumberFormatSpecifier } from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { downloadStatsPieChartCsv } from 'client/components/charts/StatsPieChart/downloadStatsPieChartCsv';
import { StatsPieChartLegend } from 'client/components/charts/StatsPieChart/StatsPieChartLegend';
import { StatsPieChartTooltip } from 'client/components/charts/StatsPieChart/StatsPieChartTooltip';
import { StatsPieChartDataItem } from 'client/components/charts/StatsPieChart/types';
import { getDefaultChartFillColor } from 'client/components/charts/utils/getDefaultChartFillColor';
import { StatsDataCard } from 'client/components/StatsDataCard';
import { snakeCase, sortBy } from 'lodash';
import { ReactNode, useMemo } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as ReChartsTooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props extends WithClassnames {
  chartTitle: string;
  chartDescription: string;
  data: StatsPieChartDataItem[] | undefined;
  isLoading: boolean;
  formatSpecifier: NumberFormatSpecifier;
  centerContent?: ReactNode;
  showLegend?: boolean;
}

export function StatsPieChart({
  className,
  chartTitle,
  chartDescription,
  data,
  formatSpecifier,
  isLoading,
  centerContent,
  showLegend,
}: Props) {
  // Sort data in descending order based on the 'value' property.
  const descendingSortedData = useMemo(
    () => sortBy(data, ({ value }) => -(value ?? 0)),
    [data],
  );

  const isDownloadCsvDisabled = !descendingSortedData?.length || isLoading;

  const handleDownloadCsv = () => {
    downloadStatsPieChartCsv({
      data: descendingSortedData,
      dataName: snakeCase(chartTitle),
    });
  };

  return (
    <StatsDataCard
      className={className}
      contentClassName="relative"
      title={chartTitle}
      description={chartDescription}
      isLoading={isLoading}
      data={descendingSortedData}
      downloadCsv={{
        onDownload: handleDownloadCsv,
        isDisabled: isDownloadCsvDisabled,
      }}
    >
      <div
        className={joinClassNames(
          'absolute inset-0',
          'flex flex-col items-center justify-center',
          // Add margin to align it to center when we have a legend on desktop.
          showLegend && 'lg:mr-40',
        )}
      >
        {centerContent}
      </div>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            // Outline is on by default so we remove it from PieChart.
            className="outline-none"
            data={descendingSortedData}
            innerRadius={80}
            outerRadius={100}
            fill="transparent"
          >
            {descendingSortedData?.map(({ name }, index) => {
              const fillColor = getDefaultChartFillColor(
                undefined,
                index,
                descendingSortedData.length,
              );

              return (
                <Cell
                  key={name}
                  // Reduce opacity so it doesn't "pop" too much compared to other charts.
                  opacity={0.4}
                  fill={fillColor}
                />
              );
            })}
          </Pie>
          <ReChartsTooltip
            content={<StatsPieChartTooltip formatSpecifier={formatSpecifier} />}
          />
          {showLegend && (
            <Legend
              content={({ payload }) => (
                <StatsPieChartLegend
                  // Only show legend on desktop
                  // Add width so centerContent is aligned to center when legend is present.
                  className="hidden w-40 lg:flex"
                  payload={payload}
                />
              )}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                height: '80%',
                overflow: 'auto',
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </StatsDataCard>
  );
}
