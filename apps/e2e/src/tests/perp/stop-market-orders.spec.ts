import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { Expected, MarginMode } from 'src/types/commonTypes';
import { OpenOrdersType, StopOrder } from 'src/types/orderTypes';
import { formatPrice } from 'src/utils/format';

type ExpectedStopOrder = Expected<StopOrder>;

/**
 * Critical Path (Smoke) tests for Stop Market orders.
 * Focus: Place → Pending → Trigger → Execution/Cancel.
 */

const DEFAULT_MARKET = 'BTC';
const DEFAULT_SIZE = '0.00225';
const FORMATTED_SIZE = '0.00225';
const DEFAULT_LEVERAGE = '10';

/** Multiplier applied to lastPrice to derive the trigger price. */
const TRIGGER_MULTIPLIER = {
  long: 1.1, // Above market – triggers when price rises
  short: 0.9, // Below market – triggers when price drops
} as const;

function buildExpectedStopOrder(
  side: BalanceSide,
  marginMode: MarginMode,
  market: string,
  formattedSize: string,
  triggerPrice: string,
): ExpectedStopOrder {
  const direction = side === 'long' ? 'long' : 'short';
  return {
    market,
    direction,
    marginMode,
    orderType: 'Stop Market',
    orderPrice: expect.any(String),
    amount: `${formattedSize}\nBTC`,
    orderValue: expect.any(String),
    triggerCondition: expect.stringContaining(formatPrice(triggerPrice)),
    reduceOnly: 'No',
    date: expect.any(String),
  };
}

test.describe('Stop Market Orders', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.StopOrders);
    await tradePage.toast.dismissAll();
  });

  test.afterEach(async () => {
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.StopOrders);
    await tradePage.positions.closeAllPositions();
  });

  test('STOP-MARKET-01: Stop Market Buy (Long) - place and assert pending @smoke', async () => {
    const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
    const triggerPrice = Math.round(
      lastPrice * TRIGGER_MULTIPLIER.long,
    ).toString();

    await tradePage.orderForm.orderTypeTabs.select('stop_market');
    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });
    await tradePage.orderForm.stopMarketInputs.fillForm({
      triggerPrice,
      size: DEFAULT_SIZE,
    });
    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    await tradePage.toast.waitForToast('Stop Market Order Placed');

    await tradePage.openOrders.waitForStopOrderCount(1);
    const stopOrders = await tradePage.openOrders.getStopOrders();
    expect.soft(stopOrders).toHaveLength(1);

    const expected = buildExpectedStopOrder(
      'long',
      MarginMode.Cross,
      DEFAULT_MARKET,
      FORMATTED_SIZE,
      triggerPrice,
    );
    expect(stopOrders[0]).toMatchObject(expected);
  });

  test('STOP-MARKET-02: Stop Market Sell (Short) - place and assert pending @smoke', async () => {
    const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
    const triggerPrice = Math.round(
      lastPrice * TRIGGER_MULTIPLIER.short,
    ).toString();

    await tradePage.orderForm.orderTypeTabs.select('stop_market');
    await tradePage.orderForm.configure({
      side: 'short',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });
    await tradePage.orderForm.stopMarketInputs.fillForm({
      triggerPrice,
      size: DEFAULT_SIZE,
    });
    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    await tradePage.toast.waitForToast('Stop Market Order Placed');

    await tradePage.openOrders.waitForStopOrderCount(1);
    const stopOrders = await tradePage.openOrders.getStopOrders();
    expect.soft(stopOrders).toHaveLength(1);

    const expected = buildExpectedStopOrder(
      'short',
      MarginMode.Cross,
      DEFAULT_MARKET,
      FORMATTED_SIZE,
      triggerPrice,
    );
    expect.soft(stopOrders[0]).toMatchObject(expected);
    expect.soft(stopOrders[0].orderType).toBe('Stop Market');
    expect(stopOrders[0].triggerCondition).toContain(formatPrice(triggerPrice));
  });
});
