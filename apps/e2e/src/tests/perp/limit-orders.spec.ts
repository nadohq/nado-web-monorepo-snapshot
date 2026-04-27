import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';
import { LimitOrder, OpenOrdersType } from 'src/types/orderTypes';
import { formatPrice } from 'src/utils/format';

interface LimitOrderTestCase {
  name: string;
  side: BalanceSide;
  marginMode: MarginMode;
  priceMultiplier: number;
  size: string;
  isSmoke?: boolean;
  expected: {
    order: Partial<LimitOrder>;
  };
}

const DEFAULT_MARKET = 'BTC';
const DEFAULT_SIZE = '0.1';
const FORMATTED_SIZE = '0.10000';
const DEFAULT_LEVERAGE = '10';

const SIDES: BalanceSide[] = ['long', 'short'];
const MARGIN_MODES = [MarginMode.Cross, MarginMode.Isolated] as const;

const SIDE_CONFIG = {
  long: {
    direction: 'long',
    orderLabel: 'long',
    priceMultiplier: 0.9, // Far below market
  },
  short: {
    direction: 'short',
    orderLabel: 'short',
    priceMultiplier: 1.1, // Far above market
  },
} as const;

const MARGIN_MODE_CONFIG: Record<
  MarginMode,
  {
    label: string;
    description: string;
  }
> = {
  [MarginMode.Cross]: {
    label: 'Cross Margin',
    description: 'shared collateral',
  },
  [MarginMode.Isolated]: {
    label: 'Isolated Margin',
    description: 'segregated margin',
  },
};

function buildExpectedOrder(
  side: BalanceSide,
  marginMode: MarginMode,
  market: string,
  price: number | any,
  formattedSize: string,
): Partial<LimitOrder> {
  const { direction } = SIDE_CONFIG[side];

  return {
    market,
    direction,
    marginMode,
    orderPrice: typeof price === 'number' ? formatPrice(price) : price,
    filledTotal: `0.00000 /\n${formattedSize}\nBTC`,
    orderType: 'Limit',
    reduceOnly: 'No',
  };
}

function buildTestCase(
  side: BalanceSide,
  marginMode: MarginMode,
): LimitOrderTestCase {
  const { orderLabel, priceMultiplier } = SIDE_CONFIG[side];
  const { label, description } = MARGIN_MODE_CONFIG[marginMode];

  return {
    name: `${orderLabel} limit order (${label}) with ${description}`,
    side,
    marginMode,
    priceMultiplier,
    size: DEFAULT_SIZE,
    expected: {
      order: buildExpectedOrder(
        side,
        marginMode,
        DEFAULT_MARKET,
        expect.any(String),
        FORMATTED_SIZE,
      ),
    },
  };
}

const LIMIT_ORDER_TEST_CASES: LimitOrderTestCase[] = SIDES.flatMap((side) =>
  MARGIN_MODES.map((marginMode) => ({
    ...buildTestCase(side, marginMode),
    isSmoke:
      (side === 'long' && marginMode === MarginMode.Isolated) ||
      (side === 'short' && marginMode === MarginMode.Cross),
  })),
);

test.describe('Limit Orders', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
  });

  test.afterEach(async () => {
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
  });

  for (const testCase of LIMIT_ORDER_TEST_CASES) {
    const tag = testCase.isSmoke ? '@smoke' : '';

    test(`places ${testCase.name} ${tag}`, async () => {
      const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
      const orderPrice = Math.round(lastPrice * testCase.priceMultiplier);

      await tradePage.orderForm.orderTypeTabs.select('limit');

      await tradePage.orderForm.configure({
        side: testCase.side,
        marginMode: testCase.marginMode,
        leverage: DEFAULT_LEVERAGE,
      });

      await tradePage.orderForm.limitInputs.fillForm({
        price: orderPrice.toString(),
        size: testCase.size,
      });

      await tradePage.orderForm.orderSettings.clickSubmitOrder();

      // Verify it appears in Open Orders
      const orders = await tradePage.openOrders.getLimitOrders();
      expect.soft(orders).toHaveLength(1);

      const order = orders[0];
      expect.soft(order).toMatchObject(testCase.expected.order);
      expect.soft(order.orderPrice).toBe(formatPrice(orderPrice));
    });
  }
});
