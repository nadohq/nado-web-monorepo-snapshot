import { expect, test } from 'src/fixtures/web3Fixture';
import { SpotPage } from 'src/pages/SpotPage';
import { Expected } from 'src/types/commonTypes';
import { OpenOrdersType, SpotDirection, StopOrder } from 'src/types/orderTypes';
import { formatPrice } from 'src/utils/format';

type ExpectedStopOrder = Expected<StopOrder>;

/**
 * Critical Path (Smoke) tests for Spot Stop Market orders.
 * Focus: Place → Pending → Verify in Open Orders.
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
  }
> = {
  buy: {
    triggerMultiplier: 1.1, // Above market – triggers when price rises
  },
  sell: {
    triggerMultiplier: 0.9, // Below market – triggers when price drops
  },
};

function buildExpectedStopOrder(
  side: SpotDirection,
  formattedSize: string,
  triggerPrice: string,
): ExpectedStopOrder {
  return {
    market: DEFAULT_MARKET,
    direction: side,
    marginMode: expect.any(String),
    orderType: 'Stop Market',
    orderPrice: expect.any(String),
    amount: `${formattedSize}\n${BASE_ASSET}`,
    orderValue: expect.any(String),
    triggerCondition: expect.stringContaining(formatPrice(triggerPrice)),
    reduceOnly: 'No',
    date: expect.any(String),
  };
}

test.describe('Spot Stop Market Orders', () => {
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

  test('SPOT-STOP-MKT-01: Stop Market Buy - place and assert pending @smoke', async () => {
    const lastPrice = await spotPage.marketInfoCard.getLastPrice();
    const triggerPrice = Math.round(
      lastPrice * SIDE_CONFIG.buy.triggerMultiplier,
    ).toString();

    await spotPage.orderForm.orderTypeTabs.select('stop_market');
    await spotPage.orderForm.configure({ side: 'buy' });

    await spotPage.orderForm.stopMarketInputs.fillForm({
      triggerPrice,
      size: DEFAULT_SIZE,
    });

    await spotPage.orderForm.orderSettings.clickSubmitOrder();

    await spotPage.toast.waitForToast('Stop Market Order Placed');

    await spotPage.openOrders.waitForStopOrderCount(1);
    const stopOrders = await spotPage.openOrders.getStopOrders();
    expect.soft(stopOrders).toHaveLength(1);

    const expected = buildExpectedStopOrder(
      'buy',
      FORMATTED_SIZE,
      triggerPrice,
    );
    expect.soft(stopOrders[0]).toMatchObject(expected);
    expect.soft(stopOrders[0].orderType).toBe('Stop Market');
    expect(stopOrders[0].triggerCondition).toContain(formatPrice(triggerPrice));
  });

  test('SPOT-STOP-MKT-02: Stop Market Sell - place and assert pending', async () => {
    const lastPrice = await spotPage.marketInfoCard.getLastPrice();
    const triggerPrice = Math.round(
      lastPrice * SIDE_CONFIG.sell.triggerMultiplier,
    ).toString();

    await spotPage.orderForm.orderTypeTabs.select('stop_market');
    await spotPage.orderForm.configure({ side: 'sell' });

    await spotPage.orderForm.stopMarketInputs.fillForm({
      triggerPrice,
      size: DEFAULT_SIZE,
    });

    await spotPage.orderForm.orderSettings.clickSubmitOrder();

    await spotPage.toast.waitForToast('Stop Market Order Placed');

    await spotPage.openOrders.waitForStopOrderCount(1);
    const stopOrders = await spotPage.openOrders.getStopOrders();
    expect.soft(stopOrders).toHaveLength(1);

    const expected = buildExpectedStopOrder(
      'sell',
      FORMATTED_SIZE,
      triggerPrice,
    );
    expect.soft(stopOrders[0]).toMatchObject(expected);
  });
});
