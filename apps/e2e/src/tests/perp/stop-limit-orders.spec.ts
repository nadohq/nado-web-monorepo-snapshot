import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { Expected, MarginMode } from 'src/types/commonTypes';
import { OpenOrdersType, StopOrder } from 'src/types/orderTypes';
import { formatPrice } from 'src/utils/format';

type ExpectedStopOrder = Expected<StopOrder>;

/**
 * Critical Path (Smoke) tests for Stop Limit orders.
 *
 * A Stop Limit order activates a limit order (not market) once the trigger
 * price is reached. This gives users price protection beyond the trigger
 * point, unlike Stop Market which executes at whatever the market offers.
 *
 * Focus: Place → Pending assertion → Trigger/Limit price validation.
 */

const DEFAULT_MARKET = 'BTC';
const DEFAULT_SIZE = '0.00225';
const FORMATTED_SIZE = '0.00225';
const DEFAULT_LEVERAGE = '10';

interface StopLimitTestCase {
  name: string;
  side: BalanceSide;
  marginMode: MarginMode;
  size: string;
  isSmoke?: boolean;
}

const SIDE_CONFIG = {
  long: {
    direction: 'long' as const,
    // Buy triggers when price rises above trigger; limit price caps fill price
    triggerMultiplier: 1.1,
    limitMultiplier: 1.105,
  },
  short: {
    direction: 'short' as const,
    // Sell triggers when price drops below trigger; limit price floors fill price
    triggerMultiplier: 0.9,
    limitMultiplier: 0.895,
  },
} as const;

function buildExpectedStopOrder(
  side: BalanceSide,
  marginMode: MarginMode,
  triggerPrice: string,
  limitPrice: string,
): ExpectedStopOrder {
  return {
    market: DEFAULT_MARKET,
    direction: SIDE_CONFIG[side].direction,
    marginMode,
    orderType: 'Stop Limit',
    orderPrice: expect.stringContaining(formatPrice(limitPrice)),
    amount: `${FORMATTED_SIZE}\nBTC`,
    orderValue: expect.any(String),
    triggerCondition: expect.stringContaining(formatPrice(triggerPrice)),
    reduceOnly: 'No',
    date: expect.any(String),
  };
}

function buildTestCase(
  side: BalanceSide,
  marginMode: MarginMode,
): StopLimitTestCase {
  const marginLabel = marginMode === MarginMode.Cross ? 'cross' : 'isolated';

  return {
    name: `${side} stop limit (${marginLabel})`,
    side,
    marginMode,
    size: DEFAULT_SIZE,
  };
}

const SIDES: BalanceSide[] = ['long', 'short'];
const MARGIN_MODES = [MarginMode.Cross, MarginMode.Isolated] as const;

const STOP_LIMIT_TEST_CASES: StopLimitTestCase[] = SIDES.flatMap((side) =>
  MARGIN_MODES.map((marginMode) => ({
    ...buildTestCase(side, marginMode),
    isSmoke:
      (side === 'long' && marginMode === MarginMode.Cross) ||
      (side === 'short' && marginMode === MarginMode.Isolated),
  })),
);

test.describe('Stop Limit Orders', () => {
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

  for (const testCase of STOP_LIMIT_TEST_CASES) {
    const tag = testCase.isSmoke ? '@smoke' : '';

    test(`places ${testCase.name} ${tag}`, async () => {
      const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
      const { triggerMultiplier, limitMultiplier } = SIDE_CONFIG[testCase.side];
      const triggerPrice = Math.round(lastPrice * triggerMultiplier).toString();
      const limitPrice = Math.round(lastPrice * limitMultiplier).toString();

      await tradePage.orderForm.orderTypeTabs.select('stop_limit');

      await tradePage.orderForm.configure({
        side: testCase.side,
        marginMode: testCase.marginMode,
        leverage: DEFAULT_LEVERAGE,
      });

      await tradePage.orderForm.stopLimitInputs.fillForm({
        triggerPrice,
        limitPrice,
        size: testCase.size,
      });

      await tradePage.orderForm.orderSettings.clickSubmitOrder();

      await tradePage.toast.waitForToast('Stop Limit Order Placed');

      await tradePage.openOrders.waitForStopOrderCount(1);
      const stopOrders = await tradePage.openOrders.getStopOrders();
      expect(stopOrders).toHaveLength(1);

      const expected = buildExpectedStopOrder(
        testCase.side,
        testCase.marginMode,
        triggerPrice,
        limitPrice,
      );
      expect.soft(stopOrders[0]).toMatchObject(expected);
      expect.soft(stopOrders[0].orderType).toBe('Stop Limit');
      expect
        .soft(stopOrders[0].triggerCondition)
        .toContain(formatPrice(triggerPrice));
      expect(stopOrders[0].orderPrice).toContain(formatPrice(limitPrice));
    });
  }
});
