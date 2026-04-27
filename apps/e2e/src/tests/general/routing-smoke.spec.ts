import { expect, test } from 'src/fixtures/web3Fixture';
import { ErrorPage } from 'src/pages/ErrorPage';

const ROUTES_TO_CHECK = [
  {
    route: '/vault',
    selectors: [
      'nlp-overview-card-tab-trigger-stats',
      'nlp-overview-card-tab-trigger-about',
      'table-tabs-trigger-balances',
      'table-tabs-trigger-positions',
      'table-tabs-trigger-open_orders',
    ],
  },
  {
    route: '/portfolio/overview',
    selectors: [
      'table-tabs-trigger-balances',
      'table-tabs-trigger-positions',
      'table-tabs-trigger-open_orders',
    ],
  },
  {
    route: '/portfolio/margin-manager',
    selectors: [],
  },
  {
    route: '/portfolio/history',
    selectors: [
      'table-tabs-trigger-trades',
      'table-tabs-trigger-order_history',
      'table-tabs-trigger-funding_payments',
      'table-tabs-trigger-interest_payments',
      'table-tabs-trigger-deposits',
      'table-tabs-trigger-withdrawals',
      'table-tabs-trigger-transfers',
      'table-tabs-trigger-nlp',
      'table-tabs-trigger-settlements',
      'table-tabs-trigger-liquidations',
    ],
  },
  {
    route: '/portfolio/faucet',
    selectors: [],
  },

  {
    route: '/points',
    selectors: ['points-tier-card-content-share-button'],
  },
  {
    route: '/referrals',
    selectors: [],
  },
  {
    route: '/spot',
    selectors: [
      'table-tabs-trigger-balances',
      'table-tabs-trigger-positions',
      'table-tabs-trigger-open_orders',
      'table-tabs-trigger-trade_history',
      'table-tabs-trigger-order_history',
      'table-tabs-trigger-funding_history',
      'table-tabs-trigger-liquidations',
    ],
  },
  {
    route: '/perpetuals',
    selectors: [
      'table-tabs-trigger-balances',
      'table-tabs-trigger-positions',
      'table-tabs-trigger-open_orders',
      'table-tabs-trigger-trade_history',
      'table-tabs-trigger-order_history',
      'table-tabs-trigger-funding_history',
      'table-tabs-trigger-liquidations',
      'market-data-tabs-trigger-book',
      'market-data-tabs-trigger-trades',
      'chart-tabs-trigger-price',
      'chart-tabs-trigger-depth',
      'chart-tabs-trigger-funding',
    ],
  },
];

for (const route of ROUTES_TO_CHECK) {
  test.describe(`Route: ${route.route}`, () => {
    test(`should load and interact without error @smoke`, async ({ page }) => {
      const errorPage = new ErrorPage(page);
      await page.goto(route.route, { waitUntil: 'domcontentloaded' });

      expect(await errorPage.isErrorPage()).toBe(false);

      for (const selector of route.selectors) {
        await test.step(`click ${selector}`, async () => {
          await page.getByTestId(selector).click();
          await page.waitForTimeout(1000);
          expect(await errorPage.isErrorPage()).toBe(false);
        });
      }
    });
  });
}
