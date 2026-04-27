import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import {
  ScaledOrderPreviewOrder,
  ScaledOrderPriceDistribution,
  ScaledOrderSizeDistribution,
} from 'src/types/scaledOrderTypes';

interface ScaledPreviewTestCase {
  name: string;
  side: BalanceSide;
  startPrice: string;
  endPrice: string;
  size: string;
  quantity: number;
  sizeDistribution: ScaledOrderSizeDistribution;
  priceDistribution: ScaledOrderPriceDistribution;
  expected: ScaledOrderPreviewOrder[];
  isSmoke?: boolean;
}

// Price range: 85,000 → 90,000 (5,000 range)
const PRICE_CONFIG = {
  long: { start: 85_000, end: 90_000 },
  short: { start: 90_000, end: 85_000 },
} as const;

// Size distribution patterns for 0.01 BTC total, 5 orders
// Evenly: 20% each
// Increasing: 6.66%, 13.33%, 20%, 26.66%, 33.33% (weighted toward end)
// Decreasing: 33.33%, 26.66%, 20%, 13.33%, 6.66% (weighted toward start)
const SIZE_PATTERNS: Record<
  ScaledOrderSizeDistribution,
  Array<{ orderRatio: string; orderSize: string }>
> = {
  [ScaledOrderSizeDistribution.Evenly]: [
    { orderRatio: '20.00%', orderSize: '0.00200' },
    { orderRatio: '20.00%', orderSize: '0.00200' },
    { orderRatio: '20.00%', orderSize: '0.00200' },
    { orderRatio: '20.00%', orderSize: '0.00200' },
    { orderRatio: '20.00%', orderSize: '0.00200' },
  ],
  [ScaledOrderSizeDistribution.Increasing]: [
    { orderRatio: '6.57%', orderSize: '0.00065' },
    { orderRatio: '13.13%', orderSize: '0.00130' },
    { orderRatio: '20.20%', orderSize: '0.00200' },
    { orderRatio: '26.77%', orderSize: '0.00265' },
    { orderRatio: '33.33%', orderSize: '0.00330' },
  ],
  [ScaledOrderSizeDistribution.Decreasing]: [
    { orderRatio: '33.33%', orderSize: '0.00330' },
    { orderRatio: '26.77%', orderSize: '0.00265' },
    { orderRatio: '20.20%', orderSize: '0.00200' },
    { orderRatio: '13.13%', orderSize: '0.00130' },
    { orderRatio: '6.57%', orderSize: '0.00065' },
  ],
};

// Price offsets for 5,000 range (from symmetry test cases)
// Flat:       [0, 1250, 2500, 3750, 5000] - linear
// Increasing: [0, 1223, 2464, 3723, 5000] - weighted toward lower prices
// Decreasing: [0, 1277, 2536, 3777, 5000] - weighted toward higher prices
const PRICE_OFFSETS = {
  [ScaledOrderPriceDistribution.Flat]: [0, 1250, 2500, 3750, 5000],
  [ScaledOrderPriceDistribution.Increasing]: [0, 1223, 2464, 3723, 5000],
  [ScaledOrderPriceDistribution.Decreasing]: [0, 1277, 2536, 3777, 5000],
} as const;

const ORDER_COUNT = 5;
const TOTAL_SIZE = '0.01';

function formatPrice(price: number): string {
  return price.toLocaleString('en-US');
}

function generatePrices(
  startPrice: number,
  endPrice: number,
  distribution: ScaledOrderPriceDistribution,
): number[] {
  const isDescending = endPrice < startPrice;
  const minPrice = Math.min(startPrice, endPrice);
  const offsets = PRICE_OFFSETS[distribution];

  // Generate prices in ascending order from minPrice
  const ascendingPrices = offsets.map((offset) => minPrice + offset);

  // If original range was descending (e.g., 90k → 85k), reverse the result
  return isDescending ? ascendingPrices.slice().reverse() : ascendingPrices;
}

function buildExpectedOrders(
  side: BalanceSide,
  sizeDistribution: ScaledOrderSizeDistribution,
  priceDistribution: ScaledOrderPriceDistribution,
): ScaledOrderPreviewOrder[] {
  const { start, end } = PRICE_CONFIG[side as 'long' | 'short'];
  const prices = generatePrices(start, end, priceDistribution);
  const sizePattern = SIZE_PATTERNS[sizeDistribution];

  return prices.map((price, index) => ({
    orderPrice: formatPrice(price),
    ...sizePattern[index],
  }));
}

const SIDES: BalanceSide[] = [
  'long',
  // 'short'
];

const SIZE_DISTRIBUTIONS = [
  ScaledOrderSizeDistribution.Evenly,
  ScaledOrderSizeDistribution.Increasing,
  ScaledOrderSizeDistribution.Decreasing,
] as const;

const PRICE_DISTRIBUTIONS = [
  ScaledOrderPriceDistribution.Flat,
  ScaledOrderPriceDistribution.Increasing,
  ScaledOrderPriceDistribution.Decreasing,
] as const;

const PREVIEW_TEST_CASES: ScaledPreviewTestCase[] = SIDES.flatMap((side) =>
  SIZE_DISTRIBUTIONS.flatMap((sizeDistribution) =>
    PRICE_DISTRIBUTIONS.map((priceDistribution) => {
      const { start, end } = PRICE_CONFIG[side as 'long' | 'short'];

      const isSmoke =
        side === 'long' &&
        sizeDistribution === ScaledOrderSizeDistribution.Evenly &&
        priceDistribution === ScaledOrderPriceDistribution.Flat;

      return {
        name: `${ORDER_COUNT} ${side} orders | size: ${sizeDistribution} | price: ${priceDistribution}`,
        side,
        startPrice: start.toString(),
        endPrice: end.toString(),
        size: TOTAL_SIZE,
        quantity: ORDER_COUNT,
        sizeDistribution,
        priceDistribution,
        expected: buildExpectedOrders(
          side,
          sizeDistribution,
          priceDistribution,
        ),
        isSmoke,
      };
    }),
  ),
);

test.describe('Scaled Orders', () => {
  for (const testCase of PREVIEW_TEST_CASES) {
    const tag = testCase.isSmoke ? '@smoke' : '';

    test(`displays ${testCase.name} ${tag}`, async ({ page }) => {
      const tradePage = new PerpPage(page);
      await tradePage.goto();

      await tradePage.orderForm.orderTypeTabs.select('multi_limit');

      await tradePage.orderForm.configure({
        side: testCase.side,
      });

      await tradePage.orderForm.scaledInputs.fillForm({
        startPrice: testCase.startPrice,
        endPrice: testCase.endPrice,
        size: testCase.size,
        quantity: testCase.quantity,
        sizeDistribution: testCase.sizeDistribution,
        priceDistribution: testCase.priceDistribution,
      });

      const ordersPreviewModal =
        await tradePage.orderForm.scaledInputs.clickPreview();

      const orders = await ordersPreviewModal.getOrders();

      expect(orders).toEqual(testCase.expected);
    });
  }
});
