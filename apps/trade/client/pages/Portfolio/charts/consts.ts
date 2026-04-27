import { mapValues } from 'lodash';

export const PORTFOLIO_CHART_GRADIENT_IDS = {
  accountEquity: 'account_equity',
  volume: 'volume',
} as const;

export const PORTFOLIO_CHART_GRADIENT_URLS = mapValues(
  PORTFOLIO_CHART_GRADIENT_IDS,
  (id) => `url(#${id})`,
);
