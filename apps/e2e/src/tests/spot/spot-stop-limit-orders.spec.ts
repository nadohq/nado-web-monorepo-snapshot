import { expect, test } from 'src/fixtures/web3Fixture';
import { SpotPage } from 'src/pages/SpotPage';
import { Expected } from 'src/types/commonTypes';
import { OpenOrdersType, SpotDirection, StopOrder } from 'src/types/orderTypes';
import { formatPrice } from 'src/utils/format';

type ExpectedStopOrder = Expected<StopOrder>;

/**
 * Critical Path (Smoke) tests for Spot Stop Limit orders.
 *
 * A Stop Limit order activates a limit order (not market) once the trigger
 * price is reached. This gives users price protection beyond the trigger
 * point, unlike Stop Market which executes at whatever the market offers.
 *
 * Focus: Place → Pending assertion → Trigger/Limit price validation.
 */

const DEFAULT_MARKET = 'kBTC/USDT0';
const DEFAULT_SIZE = '0.01';
const FORMATTED_SIZE = '0.01000';
const BASE_ASSET = 'kBTC';

/** Spot orders display 'buy'/'sell' (not 'long'/'short' like perps). */
const SIDE_CONFIG: Record<
  SpotDirection,
  {
    /** Multiplier applied to lastPrice to derive the trigger price. */
    triggerMultiplier: number;
    /** Multiplier applied to lastPrice to derive the limit price. */
    limitMultiplier: number;
  }
> = {
  buy: {
    // Buy triggers when price rises above trigger; limit price caps fill price
    triggerMultiplier: 1.1,
    limitMultiplier: 1.105,
  },
  sell: {
    // Sell triggers when price drops below trigger; limit price floors fill price
    triggerMultiplier: 0.9,
    limitMultiplier: 0.895,
  },
};

function buildExpectedStopOrder(
  side: SpotDirection,
  triggerPrice: string,
  limitPrice: string,
): ExpectedStopOrder {
  return {
    market: DEFAULT_MARKET,
    direction: side,
    marginMode: expect.any(String),
    orderType: 'Stop Limit',
    orderPrice: expect.stringContaining(formatPrice(limitPrice)),
    amount: `${FORMATTED_SIZE}\n${BASE_ASSET}`,
    orderValue: expect.any(String),
    triggerCondition: expect.stringContaining(formatPrice(triggerPrice)),
    reduceOnly: 'No',
    date: expect.any(String),
  };
}

test.describe('Spot Stop Limit Orders', () => {
  let spotPage: SpotPage;

  test.beforeEach(async ({ page }) => {
    spotPage = new SpotPage(page);
    await spotPage.goto(DEFAULT_MARKET);

    await spotPage.openOrders.cancelAllOpenOrders(OpenOrdersType.StopOrders);
    await spotPage.toast.dismissAll();
  });

  test.afterEach(async () => {
    await spotPage.openOrders.cancelAllOpenOrders(OpenOrdersType.StopOrders);
  });

  test('SPOT-STOP-LMT-01: Stop Limit Buy - place and assert pending @smoke', async () => {
    const lastPrice = await spotPage.marketInfoCard.getLastPrice();
    const triggerPrice = Math.round(
      lastPrice * SIDE_CONFIG.buy.triggerMultiplier,
    ).toString();
    const limitPrice = Math.round(
      lastPrice * SIDE_CONFIG.buy.limitMultiplier,
    ).toString();

    await spotPage.orderForm.orderTypeTabs.select('stop_limit');
    await spotPage.orderForm.configure({ side: 'buy' });

    await spotPage.orderForm.stopLimitInputs.fillForm({
      triggerPrice,
      limitPrice,
      size: DEFAULT_SIZE,
    });

    await spotPage.orderForm.orderSettings.clickSubmitOrder();

    await spotPage.toast.waitForToast('Stop Limit Order Placed');

    await spotPage.openOrders.waitForStopOrderCount(1);
    const stopOrders = await spotPage.openOrders.getStopOrders();
    expect(stopOrders).toHaveLength(1);

    const expected = buildExpectedStopOrder('buy', triggerPrice, limitPrice);
    expect.soft(stopOrders[0]).toMatchObject(expected);
    expect.soft(stopOrders[0].orderType).toBe('Stop Limit');
    expect
      .soft(stopOrders[0].triggerCondition)
      .toContain(formatPrice(triggerPrice));
    expect(stopOrders[0].orderPrice).toContain(formatPrice(limitPrice));
  });

  test('SPOT-STOP-LMT-02: Stop Limit Sell - place and assert pending', async () => {
    const lastPrice = await spotPage.marketInfoCard.getLastPrice();
    const triggerPrice = Math.round(
      lastPrice * SIDE_CONFIG.sell.triggerMultiplier,
    ).toString();
    const limitPrice = Math.round(
      lastPrice * SIDE_CONFIG.sell.limitMultiplier,
    ).toString();

    await spotPage.orderForm.orderTypeTabs.select('stop_limit');
    await spotPage.orderForm.configure({ side: 'sell' });

    await spotPage.orderForm.stopLimitInputs.fillForm({
      triggerPrice,
      limitPrice,
      size: DEFAULT_SIZE,
    });

    await spotPage.orderForm.orderSettings.clickSubmitOrder();

    await spotPage.toast.waitForToast('Stop Limit Order Placed');

    await spotPage.openOrders.waitForStopOrderCount(1);
    const stopOrders = await spotPage.openOrders.getStopOrders();
    expect(stopOrders).toHaveLength(1);

    const expected = buildExpectedStopOrder('sell', triggerPrice, limitPrice);
    expect.soft(stopOrders[0]).toMatchObject(expected);
    expect.soft(stopOrders[0].orderType).toBe('Stop Limit');
    expect
      .soft(stopOrders[0].triggerCondition)
      .toContain(formatPrice(triggerPrice));
    expect(stopOrders[0].orderPrice).toContain(formatPrice(limitPrice));
  });
});
