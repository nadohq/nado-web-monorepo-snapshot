import { getTradeAppColorVar } from 'client/modules/theme/colorVars';
import { PORTFOLIO_CHART_GRADIENT_IDS } from 'client/pages/Portfolio/charts/consts';

export function PortfolioChartGradientDefinitions() {
  return (
    <svg width={0} height={0}>
      <defs>
        <linearGradient
          id={PORTFOLIO_CHART_GRADIENT_IDS.accountEquity}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor={getTradeAppColorVar('positive')} />
          <stop
            offset="100%"
            stopColor={getTradeAppColorVar('grad-chart-stop')}
          />
        </linearGradient>
        <linearGradient
          id={PORTFOLIO_CHART_GRADIENT_IDS.volume}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor={getTradeAppColorVar('accent-info')} />
          <stop
            offset="100%"
            stopColor={getTradeAppColorVar('grad-chart-stop')}
          />
        </linearGradient>
      </defs>
    </svg>
  );
}
