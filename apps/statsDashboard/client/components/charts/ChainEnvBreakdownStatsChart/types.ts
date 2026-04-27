import { ChainEnvWithEdge } from '@nadohq/react-client';
import { StatsChartDataItem } from 'client/components/charts/StatsChart/types';

type ChainEnvBreakdownStatsChartDataKey = ChainEnvWithEdge | 'edgeCumulative';

export type ChainEnvBreakdownStatsChartDataItem =
  StatsChartDataItem<ChainEnvBreakdownStatsChartDataKey>;
