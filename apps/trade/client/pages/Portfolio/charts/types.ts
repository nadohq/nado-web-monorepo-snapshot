import { TabIdentifiable } from 'client/hooks/ui/tabs/types';
import { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';
import { ElementType } from 'react';

export interface PortfolioChartComponentProps {
  data: PortfolioChartDataItem[];
  isPrivate: boolean;
}

export interface PortfolioChartTab<
  TTabID extends string,
> extends TabIdentifiable<TTabID> {
  /** Rendered in the tab button */
  label: string;
  /** If present, rendered as a tooltip alongside the tab button label */
  labelDefinitionId?: DefinitionTooltipID;
  ChartComponent: ElementType<PortfolioChartComponentProps>;
}

export interface PortfolioChartDataItem {
  timestampMillis: number;
  portfolioValueUsd: number;
  cumulativeAccountPnlUsd: number;
  cumulativeTotalPerpPnlUsd: number;
  cumulativeTotalVolumeUsd: number;
}
