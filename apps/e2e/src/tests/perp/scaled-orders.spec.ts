import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { Expected, MarginMode } from 'src/types/commonTypes';
import { LimitOrder, OpenOrdersType } from 'src/types/orderTypes';
import { TODAY } from 'src/utils/date';
import { formatPrice } from 'src/utils/format';

type ExpectedLimitOrder = Expected<LimitOrder>;

interface ScaledPostTestCase {
  name: string;
  side: BalanceSide;
  /** Multipliers of lastPrice for start/end: long = 1.1 (above market), short = 0.9 (below market). */
  startPriceMultiplier: number;
  endPriceMultiplier: number;
  size: string;
  quantity: number;
  marginMode: MarginMode;
  leverage: string;
  expected: {
    orders: ExpectedLimitOrder[];
  };
}

const DEFAULT_MARKET = 'BTC';
const DEFAULT_LEVERAGE = '10';

const SIDE_CONFIG = {
  long: {
    direction: 'long' as const,
    /** Above market so orders do not fill immediately. */
    startPriceMultiplier: 0.85,
    endPriceMultiplier: 0.9,
  },
  short: {
    direction: 'short' as const,
    /** Below market so orders do not fill immediately. */
    startPriceMultiplier: 1.1,
    endPriceMultiplier: 1.15,
  },
} as const;

function buildExpectedScaledOrders(
  side: BalanceSide,
  startPrice: number,
  endPrice: number,
  size: string,
  quantity: number,
): ExpectedLimitOrder[] {
  const { direction } = SIDE_CONFIG[side];
  const sizeNum = parseFloat(size);
  const perOrderSize = (sizeNum / quantity).toFixed(5);
  const orders: ExpectedLimitOrder[] = [];

  for (let i = 0; i < quantity; i++) {
    const price =
      quantity === 1
        ? startPrice
        : Math.round(
            startPrice + (endPrice - startPrice) * (i / (quantity - 1)),
          );
    orders.push({
      market: DEFAULT_MARKET,
      direction,
      marginMode: expect.any(String),
      orderType: 'Limit',
      orderPrice: formatPrice(price),
      filledTotal: `0.00000 /\n${perOrderSize}\nBTC`,
      orderValue: expect.any(String),
      reduceOnly: 'No',
      date: TODAY,
    });
  }

  return orders;
}

const POST_TEST_CASES: ScaledPostTestCase[] = [
  {
    name: '2 long limit orders',
    side: 'long',
    startPriceMultiplier: SIDE_CONFIG.long.startPriceMultiplier,
    endPriceMultiplier: SIDE_CONFIG.long.endPriceMultiplier,
    size: '0.1',
    quantity: 2,
    marginMode: MarginMode.Cross,
    leverage: DEFAULT_LEVERAGE,
    expected: {
      orders: [], // Filled in test from lastPrice and multipliers
    },
  },
  {
    name: '2 short limit orders',
    side: 'short',
    startPriceMultiplier: SIDE_CONFIG.short.startPriceMultiplier,
    endPriceMultiplier: SIDE_CONFIG.short.endPriceMultiplier,
    size: '0.01',
    quantity: 2,
    marginMode: MarginMode.Cross,
    leverage: DEFAULT_LEVERAGE,
    expected: {
      orders: [],
    },
  },
];

test.describe('Scaled Orders', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.orderForm.orderTypeTabs.select('multi_limit');

    await tradePage.positions.closeAllPositions();
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
  });

  test.afterEach(async () => {
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
  });

  for (const testCase of POST_TEST_CASES) {
    test(`places ${testCase.name} @smoke`, async () => {
      const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
      const startPrice = Math.round(lastPrice * testCase.startPriceMultiplier);
      const endPrice = Math.round(lastPrice * testCase.endPriceMultiplier);

      const expectedOrders = buildExpectedScaledOrders(
        testCase.side,
        startPrice,
        endPrice,
        testCase.size,
        testCase.quantity,
      );

      await tradePage.orderForm.configure({
        side: testCase.side,
        marginMode: testCase.marginMode,
        leverage: testCase.leverage,
      });

      await tradePage.orderForm.scaledInputs.fillForm({
        startPrice: startPrice.toString(),
        endPrice: endPrice.toString(),
        size: testCase.size,
        quantity: testCase.quantity,
      });

      await tradePage.orderForm.orderSettings.clickSubmitOrder();
      await tradePage.openOrders.waitForLimitOrderCount(expectedOrders.length);

      const orders = await tradePage.openOrders.getLimitOrders();
      expect(orders).toHaveLength(expectedOrders.length);

      for (const expectedOrder of expectedOrders) {
        expect(orders).toContainEqual(expect.objectContaining(expectedOrder));
      }
    });
  }
});
