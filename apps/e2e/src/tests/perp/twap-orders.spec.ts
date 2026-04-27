import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';
import { OpenOrdersType } from 'src/types/orderTypes';

test.describe('TWAP Orders', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.Twap);

    // Ensure no old toasts are present
    await tradePage.toast.dismissAll();
  });

  test('TWAP-01: Execution progress via toast notifications @smoke', async ({
    page,
  }) => {
    // Increased timeout for long running test
    test.setTimeout(2 * 60 * 1000); // 2 minutes

    await tradePage.orderForm.orderTypeTabs.select('twap');
    // 1. Submit Order
    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
    });

    await tradePage.orderForm.twapInputs.fillForm({
      size: '0.00225',
      minutes: '1',
      frequency: '30s',
    });

    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    // 2. Phase 1 (T=0s - Immediate Execution)
    await tradePage.toast.waitForToast('TWAP Order Placed');
    await tradePage.toast.waitForToast('TWAP Market Partially Filled');
    await tradePage.toast.dismissAll();

    // Assert: Strategy row exists and shows 0.00075 / 0.00225 BTC
    await tradePage.openOrders.waitForTwapOrderCount(1);
    const ordersP1 = await tradePage.openOrders.getTwapOrders();
    expect.soft(ordersP1[0].filledTotal).toBe('0.00075 /\n0.00225\nBTC');

    // 3. Phase 2 (T=~30s - Second Chunk)
    await tradePage.toast.waitForToast(
      'TWAP Market Partially Filled',
      40 * 1000,
    );
    await tradePage.toast.dismissAll();
    await page.waitForTimeout(500);

    // Assert: Row updated to 0.0015 / 0.00225 BTC
    const ordersP2 = await tradePage.openOrders.getTwapOrders();
    expect.soft(ordersP2[0].filledTotal).toBe('0.00150 /\n0.00225\nBTC');

    // Assert: Position size is 0.00150 BTC
    const positionsP2 = await tradePage.positions.getPositions();
    expect(positionsP2[0].size).toBe('0.00150\nBTC');

    // 4. Phase 3 (T=~60s - Third Chunk)
    await tradePage.toast.waitForToast('TWAP Market Fully Filled', 80 * 1000);
    await tradePage.toast.dismissAll();
    await page.waitForTimeout(500);

    // Assert: Row updated to 0.00225 / 0.00225 BTC
    const ordersP3 = await tradePage.openOrders.getTwapOrders();
    expect.soft(ordersP3).toHaveLength(0);

    // Assert: Position size is 0.00225 BTC
    const positionsP3 = await tradePage.positions.getPositions();
    expect(positionsP3[0].size).toBe('0.00225\nBTC');
  });

  test('TWAP-02: Cancel after first execution stops further fills @smoke', async ({
    page,
  }) => {
    // Increased timeout — we need to wait long enough to confirm no second fill arrives
    test.setTimeout(2 * 60 * 1000); // 2 minutes

    await tradePage.orderForm.orderTypeTabs.select('twap');

    // 1. Submit a 3-chunk TWAP order (same config as TWAP-01)
    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
    });

    await tradePage.orderForm.twapInputs.fillForm({
      size: '0.00225',
      minutes: '1',
      frequency: '30s',
    });

    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    // 2. Wait for the first chunk to execute
    await tradePage.toast.waitForToast('TWAP Order Placed');
    await tradePage.toast.waitForToast('TWAP Market Partially Filled');
    await tradePage.toast.dismissAll();

    // Assert: Strategy row shows first chunk filled (0.00075 / 0.00225 BTC)
    await tradePage.openOrders.waitForTwapOrderCount(1);
    const ordersBeforeCancel = await tradePage.openOrders.getTwapOrders();
    expect
      .soft(ordersBeforeCancel[0].filledTotal)
      .toBe('0.00075 /\n0.00225\nBTC');

    // 3. Cancel the TWAP strategy immediately after first fill
    const twapRow = tradePage.openOrders.getTwapOrderRow(0);
    await twapRow.cancel();

    // Assert: TWAP order disappears from the open orders tab
    await tradePage.openOrders.waitForTwapOrderCount(0);

    // 4. Wait past the second chunk window (~30s) to confirm no more fills arrive
    await page.waitForTimeout(35 * 1000);

    // Assert: Position size remains at the first chunk only (0.00075 BTC)
    const positions = await tradePage.positions.getPositions();
    expect(positions).toHaveLength(1);
    expect(positions[0].size).toBe('0.00075\nBTC');
  });
});
