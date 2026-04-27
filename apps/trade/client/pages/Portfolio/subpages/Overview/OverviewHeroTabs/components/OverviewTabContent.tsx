import { BrandLoadingWrapper } from 'client/components/BrandIconLoadingWrapper/BrandLoadingWrapper';
import {
  PortfolioChartComponentProps,
  PortfolioChartDataItem,
} from 'client/pages/Portfolio/charts/types';
import { ElementType, ReactNode } from 'react';

interface Props {
  metricsContent: ReactNode;
  ChartComponent: ElementType<PortfolioChartComponentProps>;
  chartData: PortfolioChartDataItem[] | undefined;
  isPrivate: boolean;
}

export function OverviewTabContent({
  metricsContent,
  ChartComponent,
  chartData,
  isPrivate,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex flex-col gap-y-5 lg:w-1/3">{metricsContent}</div>
      {/*Chart*/}
      <div className="flex h-64 lg:h-74 lg:flex-1">
        <BrandLoadingWrapper
          iconSizeVariant="sm"
          isLoading={!chartData}
          indicatorContainerClassName="flex-1"
          grayscale
        >
          {!!chartData && (
            <ChartComponent data={chartData} isPrivate={isPrivate} />
          )}
        </BrandLoadingWrapper>
      </div>
    </div>
  );
}
