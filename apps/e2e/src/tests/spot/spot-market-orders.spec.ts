import { expect, test } from 'src/fixtures/web3Fixture';
import { SpotPage } from 'src/pages/SpotPage';
import { SpotDirection } from 'src/types/orderTypes';

interface SpotMarketOrderTestCase {
  name: string;
  side: SpotDirection;
  size: string;
}

const DEFAULT_MARKET = 'kBTC/USDT0';
const DEFAULT_SIZE = '0.01';

const SPOT_MARKET_ORDER_CASES: SpotMarketOrderTestCase[] = [
  {
    name: 'SPOT-MKT-01: Buy market order',
    side: 'buy',
    size: DEFAULT_SIZE,
  },
  {
    name: 'SPOT-MKT-02: Sell market order',
    side: 'sell',
    size: DEFAULT_SIZE,
  },
];

test.describe('Spot Market Orders', () => {
  let spotPage: SpotPage;

  test.beforeEach(async ({ page }) => {
    spotPage = new SpotPage(page);
    await spotPage.goto(DEFAULT_MARKET);

    // Dismiss any stale toasts from previous test runs
    await spotPage.toast.dismissAll();
  });

  for (const testCase of SPOT_MARKET_ORDER_CASES) {
    test(`${testCase.name} @smoke`, async () => {
      // 1. Configure order side (buy/sell)
      await spotPage.orderForm.configure({ side: testCase.side });

      // 2. Capture balance before order
      const balanceBefore = await spotPage.accountInfo.getAmount();

      // 3. Fill the size input and submit
      await spotPage.orderForm.baseInputs.sizeInput.fill(testCase.size);
      await spotPage.orderForm.orderSettings.clickSubmitOrder();

      // 4. Verify balance changed in the expected direction
      await expect
        .poll(async () => await spotPage.accountInfo.getAmount(), {
          timeout: 5000,
          intervals: [100, 250, 500],
        })
        .not.toBe(balanceBefore);

      const balanceAfter = await spotPage.accountInfo.getAmount();
      const sizeDelta = Number(testCase.size);

      if (testCase.side === 'buy') {
        expect.soft(balanceAfter).toBeCloseTo(balanceBefore + sizeDelta, 4);
      } else {
        expect.soft(balanceAfter).toBeCloseTo(balanceBefore - sizeDelta, 4);
      }
    });
  }
});
