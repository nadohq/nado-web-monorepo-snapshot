import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';

const DEFAULT_MARKET = 'XAUT';
const DEFAULT_LEVERAGE = '10';

test.describe('Market Orders', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
  });

  test.afterEach(async () => {
    await tradePage.positions.closeAllPositions();
  });

  test('increases position size with a second market order @smoke', async ({
    page,
  }) => {
    // Navigate to XAUT market
    await tradePage.goto(DEFAULT_MARKET);

    // 1. Place initial market order of size 1
    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });

    await tradePage.orderForm.baseInputs.sizeInput.fill('1');
    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    // 2. Verify initial position size is 1.00
    await tradePage.positions.waitForPositionCount(1);
    const [initialPosition] = await tradePage.positions.getPositions();
    expect.soft(initialPosition.market).toBe(DEFAULT_MARKET);
    expect(initialPosition.size).toBe(`1.000\nXAUT`);

    // 3. Place a second market order of size 3 on the same market
    await tradePage.orderForm.baseInputs.sizeInput.fill('3');
    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    // Small wait for the position to update after the second fill
    await page.waitForTimeout(1000);

    // 4. Verify position size increased to 4.00
    const [updatedPosition] = await tradePage.positions.getPositions();
    expect.soft(updatedPosition.market).toBe(DEFAULT_MARKET);
    expect(updatedPosition.size).toBe(`4.000\nXAUT`);
  });
});
