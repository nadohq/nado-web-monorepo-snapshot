import { NotificationToaster } from 'src/components/notifications/NotificationToaster';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';
import { OpenOrdersType } from 'src/types/orderTypes';
import { formatPrice } from 'src/utils/format';

const DEFAULT_LEVERAGE = '10';

/**
 * Critical Path E2E Test Suite for Limit Orders.
 *
 * Focus Areas:
 * - Order Integrity: Ensuring orders are correctly placed and reflect in the orderbook.
 * - Execution Logic: Maker vs Taker behavior (crossing the spread).
 * - Margin Safety: Reduce-Only flag constraints.
 */
test.describe('Limit Orders - Integrity and Logic', () => {
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

  test('Maker Logic: Orderbook Placement (Buy & Sell)', async () => {
    const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
    const buyPrice = Math.round(lastPrice * 0.9);
    const sellPrice = Math.round(lastPrice * 1.1);

    await tradePage.orderForm.orderTypeTabs.select('limit');

    // Place a Long Limit order far below market
    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });

    await tradePage.orderForm.limitInputs.fillForm({
      price: buyPrice.toString(),
      size: '0.01',
    });

    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    // Verify it appears in Open Orders and is not executed
    const buyOrders = await tradePage.openOrders.getLimitOrders();
    expect.soft(buyOrders).toHaveLength(1);
    expect.soft(buyOrders[0].orderPrice).toBe(formatPrice(buyPrice));
    expect.soft(buyOrders[0].direction).toBe('long');

    // Place a Short Limit order far above market
    await tradePage.orderForm.configure({
      side: 'short',
    });

    await tradePage.orderForm.limitInputs.fillForm({
      price: sellPrice.toString(),
      size: '0.01',
    });

    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    // Verify both orders are in the book
    const allOrders = await tradePage.openOrders.getLimitOrders();
    expect.soft(allOrders).toHaveLength(2);

    const sellOrder = allOrders.find((o) => o.direction === 'short');
    expect.soft(sellOrder?.orderPrice).toBe(formatPrice(sellPrice));
  });

  test('Reduce-Only fails if it would open a new position', async ({
    page,
  }) => {
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
      size: '0.01',
    });
    await tradePage.orderForm.orderSettings.setReduceOnly(true);

    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    const toaster = new NotificationToaster(page);
    const errorToast = await toaster.waitForToast('Limit Order Failed');

    expect
      .soft(errorToast.description)
      .toContain('Reduce only order increases position');

    const orders = await tradePage.openOrders.getLimitOrders();
    expect.soft(orders).toHaveLength(0);
  });

  test('Execution: Crossing the Spread (Taker behavior) @smoke', async () => {
    const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
    const orderPrice = Math.round(lastPrice * 1.1); // Buy above market

    await tradePage.orderForm.orderTypeTabs.select('limit');

    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });

    // Buy at a price much higher than market to ensure immediate execution
    await tradePage.orderForm.limitInputs.fillForm({
      price: orderPrice.toString(),
      size: '0.01',
    });

    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    // Verify it's not in Open Orders
    const orders = await tradePage.openOrders.getLimitOrders();
    expect.soft(orders).toHaveLength(0);

    // Verify a position is opened
    const positions = await tradePage.positions.getPositions();
    expect.soft(positions).toHaveLength(1);
    expect.soft(positions[0].market).toBe('BTC');
  });
});
