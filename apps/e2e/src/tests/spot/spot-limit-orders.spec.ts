import { expect, test } from 'src/fixtures/web3Fixture';
import { SpotPage } from 'src/pages/SpotPage';
import { Expected } from 'src/types/commonTypes';
import {
  LimitOrder,
  OpenOrdersType,
  SpotDirection,
} from 'src/types/orderTypes';
import { formatPrice } from 'src/utils/format';

type ExpectedLimitOrder = Expected<LimitOrder>;

interface SpotLimitOrderTestCase {
  name: string;
  side: SpotDirection;
  /** Multiplier applied to lastPrice to derive the limit price. */
  priceMultiplier: number;
  size: string;
  expected: {
    order: ExpectedLimitOrder;
  };
}

const DEFAULT_MARKET = 'kBTC/USDT0';
const DEFAULT_SIZE = '0.01';
const FORMATTED_SIZE = '0.01000';
const BASE_ASSET = 'kBTC';

/** Spot orders display 'buy'/'sell'. */
const SIDE_CONFIG: Record<
  SpotDirection,
  {
    direction: SpotDirection;
    priceMultiplier: number;
  }
> = {
  buy: {
    direction: 'buy',
    /** Below market so the buy limit does not fill immediately. */
    priceMultiplier: 0.9,
  },
  sell: {
    direction: 'sell',
    /** Above market so the sell limit does not fill immediately. */
    priceMultiplier: 1.1,
  },
};

function buildExpectedOrder(
  side: SpotDirection,
  formattedSize: string,
): ExpectedLimitOrder {
  const { direction } = SIDE_CONFIG[side];

  return {
    market: DEFAULT_MARKET,
    direction,
    marginMode: expect.any(String),
    orderType: 'Limit',
    orderPrice: expect.any(String),
    filledTotal: `0.00000 /\n${formattedSize}\n${BASE_ASSET}`,
    orderValue: expect.any(String),
    reduceOnly: 'No',
    date: expect.any(String),
  };
}

function buildTestCase(side: SpotDirection): SpotLimitOrderTestCase {
  const { priceMultiplier } = SIDE_CONFIG[side];
  const sideLabel = side === 'buy' ? 'Buy' : 'Sell';

  return {
    name: `SPOT-LMT-0${side === 'buy' ? '1' : '2'}: ${sideLabel} limit order`,
    side,
    priceMultiplier,
    size: DEFAULT_SIZE,
    expected: {
      order: buildExpectedOrder(side, FORMATTED_SIZE),
    },
  };
}

const SPOT_LIMIT_ORDER_CASES: SpotLimitOrderTestCase[] = [
  buildTestCase('buy'),
  buildTestCase('sell'),
];

test.describe('Spot Limit Orders', () => {
  let spotPage: SpotPage;

  test.beforeEach(async ({ page }) => {
    spotPage = new SpotPage(page);
    await spotPage.goto(DEFAULT_MARKET);

    await spotPage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
    await spotPage.toast.dismissAll();
  });

  test.afterEach(async () => {
    await spotPage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
  });

  for (const testCase of SPOT_LIMIT_ORDER_CASES) {
    test(`${testCase.name} @smoke`, async () => {
      const lastPrice = await spotPage.marketInfoCard.getLastPrice();
      const orderPrice = Math.round(lastPrice * testCase.priceMultiplier);

      await spotPage.orderForm.orderTypeTabs.select('limit');
      await spotPage.orderForm.configure({ side: testCase.side });

      await spotPage.orderForm.limitInputs.fillForm({
        price: orderPrice.toString(),
        size: testCase.size,
      });

      await spotPage.orderForm.orderSettings.clickSubmitOrder();

      // Verify order appears in Open Orders
      await spotPage.openOrders.waitForLimitOrderCount(1);
      const orders = await spotPage.openOrders.getLimitOrders();
      expect.soft(orders).toHaveLength(1);

      const order = orders[0];
      expect.soft(order).toMatchObject(testCase.expected.order);
      expect.soft(order.orderPrice).toBe(formatPrice(orderPrice));
    });
  }

  test('SPOT-LMT-03: Cancel a placed limit order @smoke', async () => {
    // Place a buy limit order below market to ensure it doesn't fill
    const lastPrice = await spotPage.marketInfoCard.getLastPrice();
    const orderPrice = Math.round(lastPrice * SIDE_CONFIG.buy.priceMultiplier);

    await spotPage.orderForm.orderTypeTabs.select('limit');
    await spotPage.orderForm.configure({ side: 'buy' });

    await spotPage.orderForm.limitInputs.fillForm({
      price: orderPrice.toString(),
      size: DEFAULT_SIZE,
    });

    await spotPage.orderForm.orderSettings.clickSubmitOrder();

    // Wait for the order to appear
    await spotPage.openOrders.waitForLimitOrderCount(1);
    const ordersBefore = await spotPage.openOrders.getLimitOrders();
    expect(ordersBefore).toHaveLength(1);

    // Cancel the order
    const orderRow = spotPage.openOrders.getLimitOrderRow(0);
    await orderRow.cancel();

    // Verify the order was removed
    await spotPage.openOrders.waitForLimitOrderCount(0);
    const ordersAfter = await spotPage.openOrders.getLimitOrders();
    expect(ordersAfter).toHaveLength(0);
  });
});
