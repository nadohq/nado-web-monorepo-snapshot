import { expect, test } from 'src/fixtures/web3Fixture';
import { SpotPage } from 'src/pages/SpotPage';
import { Expected } from 'src/types/commonTypes';
import {
  LimitOrder,
  OpenOrdersType,
  SpotDirection,
} from 'src/types/orderTypes';
import { TODAY } from 'src/utils/date';
import { formatPrice } from 'src/utils/format';

type ExpectedLimitOrder = Expected<LimitOrder>;

/**
 * Critical Path (Smoke) tests for Spot Scaled (Multi-Limit) orders.
 * Scaled orders split a single intent into multiple limit orders spread
 * across a price range.
 *
 * Focus: Place → Verify all child limit orders appear in Open Orders.
 */

const DEFAULT_MARKET = 'kBTC/USDT0';
const BASE_ASSET = 'kBTC';

interface SpotScaledTestCase {
  name: string;
  side: SpotDirection;
  /** Multiplier of lastPrice for the start of the price range. */
  startPriceMultiplier: number;
  /** Multiplier of lastPrice for the end of the price range. */
  endPriceMultiplier: number;
  size: string;
  quantity: number;
}

/** Spot orders display 'buy'/'sell' (not 'long'/'short' like perps). */
const SIDE_CONFIG: Record<
  SpotDirection,
  {
    startPriceMultiplier: number;
    endPriceMultiplier: number;
  }
> = {
  buy: {
    /** Below market so buy orders do not fill immediately. */
    startPriceMultiplier: 0.85,
    endPriceMultiplier: 0.9,
  },
  sell: {
    /** Above market so sell orders do not fill immediately. */
    startPriceMultiplier: 1.1,
    endPriceMultiplier: 1.15,
  },
};

function buildExpectedScaledOrders(
  side: SpotDirection,
  startPrice: number,
  endPrice: number,
  size: string,
  quantity: number,
): ExpectedLimitOrder[] {
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
      direction: side,
      marginMode: expect.any(String),
      orderType: 'Limit',
      orderPrice: formatPrice(price),
      filledTotal: `0.00000 /\n${perOrderSize}\n${BASE_ASSET}`,
      orderValue: expect.any(String),
      reduceOnly: 'No',
      date: TODAY,
    });
  }

  return orders;
}

const SPOT_SCALED_CASES: SpotScaledTestCase[] = [
  {
    name: 'SPOT-SCALED-01: 2 buy scaled limit orders',
    side: 'buy',
    startPriceMultiplier: SIDE_CONFIG.buy.startPriceMultiplier,
    endPriceMultiplier: SIDE_CONFIG.buy.endPriceMultiplier,
    size: '0.02',
    quantity: 2,
  },
  {
    name: 'SPOT-SCALED-02: 2 sell scaled limit orders',
    side: 'sell',
    startPriceMultiplier: SIDE_CONFIG.sell.startPriceMultiplier,
    endPriceMultiplier: SIDE_CONFIG.sell.endPriceMultiplier,
    size: '0.02',
    quantity: 2,
  },
];

test.describe('Spot Scaled Orders', () => {
  let spotPage: SpotPage;

  test.beforeEach(async ({ page }) => {
    spotPage = new SpotPage(page);
    await spotPage.goto(DEFAULT_MARKET);

    await spotPage.orderForm.orderTypeTabs.select('multi_limit');

    await spotPage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
    await spotPage.toast.dismissAll();
  });

  test.afterEach(async () => {
    await spotPage.openOrders.cancelAllOpenOrders(OpenOrdersType.LimitOrders);
  });

  for (const testCase of SPOT_SCALED_CASES) {
    test(`${testCase.name} @smoke`, async () => {
      const lastPrice = await spotPage.marketInfoCard.getLastPrice();
      const startPrice = Math.round(lastPrice * testCase.startPriceMultiplier);
      const endPrice = Math.round(lastPrice * testCase.endPriceMultiplier);

      const expectedOrders = buildExpectedScaledOrders(
        testCase.side,
        startPrice,
        endPrice,
        testCase.size,
        testCase.quantity,
      );

      await spotPage.orderForm.configure({ side: testCase.side });

      await spotPage.orderForm.scaledInputs.fillForm({
        startPrice: startPrice.toString(),
        endPrice: endPrice.toString(),
        size: testCase.size,
        quantity: testCase.quantity,
      });

      await spotPage.orderForm.orderSettings.clickSubmitOrder();
      await spotPage.openOrders.waitForLimitOrderCount(expectedOrders.length);

      const orders = await spotPage.openOrders.getLimitOrders();
      expect(orders).toHaveLength(expectedOrders.length);

      for (const expectedOrder of expectedOrders) {
        expect(orders).toContainEqual(expect.objectContaining(expectedOrder));
      }
    });
  }
});
