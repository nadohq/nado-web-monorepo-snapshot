export const ROUTE_APP_PORTFOLIO_PREFIX = '/portfolio';

export const PORTFOLIO_SUBROUTES = {
  overview: 'overview',
  marginManager: 'margin-manager',
  history: 'history',
  faucet: 'faucet',
};

export const ROUTES = {
  perpTrading: '/perpetuals',
  points: '/points',
  portfolio: {
    base: ROUTE_APP_PORTFOLIO_PREFIX,
    overview: `${ROUTE_APP_PORTFOLIO_PREFIX}/${PORTFOLIO_SUBROUTES.overview}`,
    marginManager: `${ROUTE_APP_PORTFOLIO_PREFIX}/${PORTFOLIO_SUBROUTES.marginManager}`,
    history: `${ROUTE_APP_PORTFOLIO_PREFIX}/${PORTFOLIO_SUBROUTES.history}`,
    faucet: `${ROUTE_APP_PORTFOLIO_PREFIX}/${PORTFOLIO_SUBROUTES.faucet}`,
  },
  referrals: '/referrals',
  spotTrading: '/spot',
  vault: '/vault',
} as const;
