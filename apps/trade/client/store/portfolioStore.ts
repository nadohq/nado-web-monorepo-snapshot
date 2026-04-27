import { ChartTimespan } from 'client/modules/charts/types';
import { PortfolioHistoryTabID } from 'client/pages/Portfolio/subpages/History/types';
import { atom } from 'jotai';

export const portfolioHistoryTabIdAtom = atom<PortfolioHistoryTabID>('trades');

export const portfolioTimespanAtom = atom<ChartTimespan>('24h');
