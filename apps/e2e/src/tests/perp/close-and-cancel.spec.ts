import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';
import { OpenOrdersType } from 'src/types/orderTypes';

const DEFAULT_MARKET = 'BTC';
const DEFAULT_LEVERAGE = '10';

test.describe('Close & Cancel', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
  });

  test.afterEach(async () => {
    await tradePage.positions.closeAllPositions();
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
  });

  test('cancels individual limit order and verifies removal from open orders @smoke', async () => {
    // Place a limit order far from market price so it stays pending
    const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
    const orderPrice = Math.round(lastPrice * 0.9);

    await tradePage.orderForm.orderTypeTabs.select('limit');

    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });

    await tradePage.orderForm.limitInputs.fillForm({
      price: orderPrice.toString(),
      size: '0.1',
    });

    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    // Verify the order appears in open orders
    const ordersBeforeCancel = await tradePage.openOrders.getLimitOrders();
    expect.soft(ordersBeforeCancel).toHaveLength(1);
    expect.soft(ordersBeforeCancel[0].market).toBe(DEFAULT_MARKET);

    // Cancel the individual order via its row action button
    const orderRow = tradePage.openOrders.getLimitOrderRow(0);
    await orderRow.cancel();

    // Verify the order is removed from open orders
    await tradePage.openOrders.waitForLimitOrderCount(0);

    const ordersAfterCancel = await tradePage.openOrders.getLimitOrders();
    expect(ordersAfterCancel).toHaveLength(0);
  });

  test('closes single position via row action and verifies removal @smoke', async ({
    page,
  }) => {
    // Open a market position
    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });

    await tradePage.orderForm.baseInputs.sizeInput.fill('0.1');
    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    // Verify the position appears and resolve the specific row by market
    await tradePage.positions.waitForPositionCount(1, 10 * 1000);
    const positionsBeforeClose = await tradePage.positions.getPositions();
    expect.soft(positionsBeforeClose).toHaveLength(1);
    expect.soft(positionsBeforeClose[0].market).toBe(DEFAULT_MARKET);
    expect.soft(positionsBeforeClose[0].direction).toBe('long');

    // Close the position via market name to avoid index-based race conditions
    await tradePage.positions.closePositionByMarket(DEFAULT_MARKET);

    // Verify the position is removed
    await tradePage.positions.waitForPositionCount(0, 10 * 1000);
    await page.waitForTimeout(2 * 1000);

    const positionsAfterClose = await tradePage.positions.getPositions();
    expect(positionsAfterClose).toHaveLength(0);
  });
});
