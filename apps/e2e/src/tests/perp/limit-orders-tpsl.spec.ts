import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';
import {
  ExpectedConditionalOrder,
  LimitOrder,
  OpenOrdersType,
} from 'src/types/orderTypes';
import { TpSlInput } from 'src/types/tpslTypes';
import { TODAY } from 'src/utils/date';
import { formatPrice } from 'src/utils/format';

interface LimitOrderWithTpSlTestCase {
  name: string;
  side: BalanceSide;
  marginMode: MarginMode;
  priceMultiplier: number;
  size: string;
  tpsl: TpSlInput;
  expected: {
    order: Partial<LimitOrder>;
    conditionalOrders: ExpectedConditionalOrder[];
  };
}

const DEFAULT_MARKET = 'BTC';
const DEFAULT_SIZE = '0.1';
const FORMATTED_SIZE = '0.10000';
const DEFAULT_LEVERAGE = '10';

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

function buildExpectedConditionalOrders(
  tpsl: TpSlInput,
): ExpectedConditionalOrder[] {
  const orders: ExpectedConditionalOrder[] = [];

  if (tpsl.tp) {
    orders.push({
      orderType: 'TP Market',
      direction: expect.any(String),
      orderPrice: expect.any(String),
      amount: expect.any(String),
      orderValue: expect.any(String),
      reduceOnly: 'Yes',
      date: TODAY,
    });
  }

  if (tpsl.sl) {
    orders.push({
      orderType: 'SL Market',
      direction: expect.any(String),
      orderPrice: expect.any(String),
      amount: expect.any(String),
      orderValue: expect.any(String),
      reduceOnly: 'Yes',
      date: TODAY,
    });
  }

  return orders;
}

const TPSL_TEST_CASES: LimitOrderWithTpSlTestCase[] = [
  {
    name: 'long limit order with TP and SL (% gain/loss)',
    side: 'long',
    marginMode: MarginMode.Cross,
    priceMultiplier: SIDE_CONFIG.long.priceMultiplier,
    size: DEFAULT_SIZE,
    tpsl: {
      tp: { gain: '50' },
      sl: { loss: '50' },
    },
    expected: {
      order: buildExpectedOrder(
        'long',
        MarginMode.Cross,
        DEFAULT_MARKET,
        expect.any(String),
        FORMATTED_SIZE,
      ),
      conditionalOrders: buildExpectedConditionalOrders({
        tp: { gain: '50' },
        sl: { loss: '50' },
      }),
    },
  },
  {
    name: 'short limit order with TP and SL (% gain/loss)',
    side: 'short',
    marginMode: MarginMode.Cross,
    priceMultiplier: SIDE_CONFIG.short.priceMultiplier,
    size: DEFAULT_SIZE,
    tpsl: {
      tp: { gain: '50' },
      sl: { loss: '50' },
    },
    expected: {
      order: buildExpectedOrder(
        'short',
        MarginMode.Cross,
        DEFAULT_MARKET,
        expect.any(String),
        FORMATTED_SIZE,
      ),
      conditionalOrders: buildExpectedConditionalOrders({
        tp: { gain: '50' },
        sl: { loss: '50' },
      }),
    },
  },
];

test.describe('Limit Orders with TP/SL', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.TpSl);
  });

  test.afterEach(async () => {
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
    await tradePage.openOrders.cancelAllOpenOrders(OpenOrdersType.TpSl);
  });

  for (const testCase of TPSL_TEST_CASES) {
    test(`places ${testCase.name} @smoke`, async () => {
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

      await tradePage.orderForm.limitInputs.tpsl.setTpSl(testCase.tpsl);
      await tradePage.orderForm.orderSettings.clickSubmitOrder();

      // Verify Limit order appears in Open Orders
      const limitOrders = await tradePage.openOrders.getLimitOrders();
      expect.soft(limitOrders).toHaveLength(1);

      expect.soft(limitOrders[0]).toMatchObject(testCase.expected.order);
      expect.soft(limitOrders[0].orderPrice).toBe(formatPrice(orderPrice));

      // Verify TP/SL orders appear in TP/SL tab
      await tradePage.openOrders.waitForTpSlOrderCount(
        testCase.expected.conditionalOrders.length,
      );
      const tpslOrders = await tradePage.openOrders.getTpSlOrders();
      expect
        .soft(tpslOrders)
        .toHaveLength(testCase.expected.conditionalOrders.length);

      for (const expectedOrder of testCase.expected.conditionalOrders) {
        expect
          .soft(tpslOrders)
          .toContainEqual(expect.objectContaining(expectedOrder));
      }
    });
  }
});
