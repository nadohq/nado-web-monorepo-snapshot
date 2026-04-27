import { useChartTimeAxisFormatter } from 'client/modules/charts/hooks/useChartTimeAxisFormatter';
import { portfolioTimespanAtom } from 'client/store/portfolioStore';
import { useAtom } from 'jotai';

export function usePortfolioChartXAxisFormatter() {
  const [timespan] = useAtom(portfolioTimespanAtom);

  return useChartTimeAxisFormatter(timespan);
}
