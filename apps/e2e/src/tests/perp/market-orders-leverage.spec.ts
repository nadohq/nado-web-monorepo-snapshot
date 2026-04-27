import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';

interface LeverageTestCase {
  leverage: string;
  multiplier: number;
}

const LEVERAGE_TEST_CASES: LeverageTestCase[] = [
  { leverage: '1', multiplier: 1 },
  { leverage: '5', multiplier: 5 },
  { leverage: '10', multiplier: 10 },
  { leverage: '40', multiplier: 40 },
];

// Tolerance for floating point comparison (5% margin for price change / rounding differences)
const TOLERANCE = 0.05;

function isWithinTolerance(
  actual: number,
  expected: number,
  tolerance: number,
): boolean {
  const diff = Math.abs(actual - expected) / expected;
  return diff <= tolerance;
}

test.describe('Market Orders - Leverage Max Size', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
  });

  test.afterEach(async () => {
    await tradePage.positions.closeAllPositions();
  });

  test('max size scales correctly with leverage multiplier', async () => {
    // Set initial state: Buy/Long side with Cross margin
    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
    });

    // Get base max size at 1x leverage
    await tradePage.orderForm.selectLeverage('1');
    const baseMaxSize = await tradePage.orderForm.baseInputs.getMaxSize();

    expect(baseMaxSize).toBeGreaterThan(0);

    // Verify each leverage multiplier
    for (const testCase of LEVERAGE_TEST_CASES) {
      await tradePage.orderForm.selectLeverage(testCase.leverage);

      const actualMaxSize = await tradePage.orderForm.baseInputs.getMaxSize();
      const expectedMaxSize = baseMaxSize * testCase.multiplier;

      expect(
        isWithinTolerance(actualMaxSize, expectedMaxSize, TOLERANCE),
        `Leverage ${testCase.leverage}x: expected max size ~${expectedMaxSize.toFixed(2)}, got ${actualMaxSize.toFixed(2)}`,
      ).toBe(true);
    }
  });

  test('max size scales correctly for short side', async () => {
    // Set initial state: Sell/Short side with Cross margin
    await tradePage.orderForm.configure({
      side: 'short',
      marginMode: MarginMode.Cross,
    });

    // Get base max size at 1x leverage
    await tradePage.orderForm.selectLeverage('1');
    const baseMaxSize = await tradePage.orderForm.baseInputs.getMaxSize();

    expect(baseMaxSize).toBeGreaterThan(0);

    // Verify selected leverage multipliers
    const selectedLeverages: LeverageTestCase[] = [
      { leverage: '5', multiplier: 5 },
      { leverage: '10', multiplier: 10 },
    ];

    for (const testCase of selectedLeverages) {
      await tradePage.orderForm.selectLeverage(testCase.leverage);

      const actualMaxSize = await tradePage.orderForm.baseInputs.getMaxSize();
      const expectedMaxSize = baseMaxSize * testCase.multiplier;

      expect(
        isWithinTolerance(actualMaxSize, expectedMaxSize, TOLERANCE),
        `Leverage ${testCase.leverage}x: expected max size ~${expectedMaxSize.toFixed(2)}, got ${actualMaxSize.toFixed(2)}`,
      ).toBe(true);
    }
  });
});
