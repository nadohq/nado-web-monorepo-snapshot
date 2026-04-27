import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';

interface ClosePositionTestCase {
  name: string;
  openSide: BalanceSide;
  closeSide: BalanceSide;
  size: string;
  formattedSize: string;
  marginMode: MarginMode;
  leverage: string;
  isSmoke?: boolean;
}

const DEFAULT_SIZE = '0.01';
const FORMATTED_SIZE = '0.01000';
const DEFAULT_LEVERAGE = '10';

const SIDE_CONFIG = {
  long: {
    opposite: 'short' as BalanceSide,
    label: 'long',
  },
  short: {
    opposite: 'long' as BalanceSide,
    label: 'short',
  },
} as const;

function buildTestCase(
  openSide: BalanceSide,
  marginMode: MarginMode,
): ClosePositionTestCase {
  const { opposite, label } = SIDE_CONFIG[openSide as 'long' | 'short'];

  return {
    name: `${label} position by closing with opposite direction (${marginMode})`,
    openSide,
    closeSide: opposite,
    size: DEFAULT_SIZE,
    formattedSize: FORMATTED_SIZE,
    marginMode,
    leverage: DEFAULT_LEVERAGE,
  };
}

const SIDES: BalanceSide[] = ['long', 'short'];
const MARGIN_MODES = [MarginMode.Cross, MarginMode.Isolated] as const;

const CLOSE_POSITION_TEST_CASES: ClosePositionTestCase[] = SIDES.flatMap(
  (side) =>
    MARGIN_MODES.map((marginMode) => ({
      ...buildTestCase(side, marginMode),
      isSmoke:
        (side === 'long' && marginMode === MarginMode.Isolated) ||
        (side === 'short' && marginMode === MarginMode.Cross),
    })),
);

test.describe('Market Orders - Opposite Direction', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
  });

  test.afterEach(async () => {
    await tradePage.positions.closeAllPositions();
  });

  for (const testCase of CLOSE_POSITION_TEST_CASES) {
    const tag = testCase.isSmoke ? '@smoke' : '';

    test(`closes ${testCase.name} ${tag}`, async () => {
      // Open initial position
      await tradePage.orderForm.configure({
        side: testCase.openSide,
        marginMode: testCase.marginMode,
        leverage: testCase.leverage,
      });

      await tradePage.orderForm.baseInputs.sizeInput.fill(testCase.size);
      await tradePage.orderForm.orderSettings.clickSubmitOrder();

      const positionsBefore = await tradePage.positions.getPositions();
      expect.soft(positionsBefore).toHaveLength(1);

      // Open opposite position of same size to close
      await tradePage.orderForm.configure({
        side: testCase.closeSide,
      });

      await tradePage.orderForm.baseInputs.sizeInput.fill(testCase.size);
      await tradePage.orderForm.orderSettings.clickSubmitOrder();

      const positionsAfter = await tradePage.positions.getPositions();

      expect.soft(positionsAfter).toHaveLength(0);
    });
  }
});
