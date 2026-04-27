import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';

const DEFAULT_MARKET = 'BTC';
const DEFAULT_SIZE = '0.001';
const DEFAULT_LEVERAGE = '10';

const DIRECTION_MAP: Record<BalanceSide, BalanceSide> = {
  long: 'long',
  short: 'short',
};

const REVERSE_DIRECTION_MAP: Record<BalanceSide, BalanceSide> = {
  long: 'short',
  short: 'long',
};

// Generate all combinations: 2 sides × 2 margin modes = 4 test cases
const TEST_CASES = (['long', 'short'] as BalanceSide[]).flatMap((side) =>
  [MarginMode.Cross, MarginMode.Isolated].map((marginMode) => ({
    side,
    marginMode,
    isSmoke:
      (side === 'long' && marginMode === MarginMode.Isolated) ||
      (side === 'short' && marginMode === MarginMode.Cross),
  })),
);

test.describe('Market Orders - Reverse Position', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
  });

  test.afterEach(async () => {
    await tradePage.positions.closeAllPositions();
  });

  for (const { side, marginMode, isSmoke } of TEST_CASES) {
    const initialDirection = DIRECTION_MAP[side];
    const reversedDirection = REVERSE_DIRECTION_MAP[initialDirection];
    const tag = isSmoke ? '@smoke' : '';

    test(`reverses ${initialDirection.toLowerCase()} to ${reversedDirection.toLowerCase()} (${marginMode}) ${tag}`, async () => {
      await tradePage.orderForm.configure({
        side,
        marginMode,
        leverage: DEFAULT_LEVERAGE,
      });
      await tradePage.orderForm.baseInputs.sizeInput.fill(DEFAULT_SIZE);
      await tradePage.orderForm.orderSettings.clickSubmitOrder();

      const [initialPosition] = await tradePage.positions.getPositions();
      expect.soft(initialPosition.direction).toBe(initialDirection);
      expect.soft(initialPosition.marginMode).toBe(marginMode);

      const reverseModal = await tradePage.positions
        .getPositionRow(0)
        .clickReverse();
      const details = await reverseModal.getDialogDetails();

      expect.soft(details.marketName).toBe(DEFAULT_MARKET);
      expect.soft(details.orderType).toBe('Market');

      await reverseModal.submit();
      await tradePage.positions.waitForPositionCount(1);

      const [reversedPosition] = await tradePage.positions.getPositions();
      expect.soft(reversedPosition.direction).toBe(reversedDirection);
      expect.soft(reversedPosition.marginMode).toBe(marginMode);
    });
  }
});
