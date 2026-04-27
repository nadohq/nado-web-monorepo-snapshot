import { BalanceSide } from '@nadohq/client';
import { NotificationToaster } from 'src/components/notifications/NotificationToaster';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode, ToastData } from 'src/types/commonTypes';

interface ReduceOnlyErrorTestCase {
  name: string;
  side: BalanceSide;
  size: string;
  isSmoke?: boolean;
  expected: {
    toast: ToastData;
  };
}

interface ReduceOnlyPartialTestCase {
  name: string;
  openSide: BalanceSide;
  closeSide: BalanceSide;
  openSize: string;
  reduceSize: string;
  expectedRemainingSize: string;
  isSmoke?: boolean;
}

const DEFAULT_SIZE = '0.001';
const DEFAULT_LEVERAGE = '10';

const REDUCE_ONLY_ERROR_TEST_CASES: ReduceOnlyErrorTestCase[] = [
  {
    name: 'reduce-only sell without position',
    side: 'short',
    size: DEFAULT_SIZE,
    isSmoke: true,
    expected: {
      toast: {
        title: 'Market Order Failed',
        description: 'Reduce only order increases position.',
      },
    },
  },
  {
    name: 'reduce-only buy without position',
    side: 'long',
    size: DEFAULT_SIZE,
    expected: {
      toast: {
        title: 'Market Order Failed',
        description: 'Reduce only order increases position.',
      },
    },
  },
];

const REDUCE_ONLY_PARTIAL_TEST_CASES: ReduceOnlyPartialTestCase[] = [
  {
    name: 'partial reduce-only sell on long position',
    openSide: 'long',
    closeSide: 'short',
    openSize: '0.002',
    reduceSize: '0.001',
    expectedRemainingSize: '0.00100',
    isSmoke: true,
  },
  {
    name: 'partial reduce-only buy on short position',
    openSide: 'short',
    closeSide: 'long',
    openSize: '0.002',
    reduceSize: '0.001',
    expectedRemainingSize: '0.00100',
  },
];

test.describe('Market Orders - Reduce Only', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
  });

  test.afterEach(async () => {
    await tradePage.positions.closeAllPositions();
  });

  for (const testCase of REDUCE_ONLY_ERROR_TEST_CASES) {
    const tag = testCase.isSmoke ? '@smoke' : '';

    test(`fails ${testCase.name} ${tag}`, async ({ page }) => {
      await tradePage.orderForm.configure({
        side: testCase.side,
      });

      await tradePage.orderForm.baseInputs.sizeInput.fill(testCase.size);
      await tradePage.orderForm.orderSettings.setReduceOnly(true);
      await tradePage.orderForm.orderSettings.clickSubmitOrder();

      const toaster = new NotificationToaster(page);
      const errorToast = await toaster.waitForToast(
        testCase.expected.toast.title,
      );

      expect.soft(errorToast.title).toBe(testCase.expected.toast.title);
      expect
        .soft(errorToast.description)
        .toBe(testCase.expected.toast.description);

      const positions = await tradePage.positions.getPositions();
      expect.soft(positions).toHaveLength(0);
    });
  }

  for (const testCase of REDUCE_ONLY_PARTIAL_TEST_CASES) {
    const tag = testCase.isSmoke ? '@smoke' : '';

    test(`executes ${testCase.name} ${tag}`, async () => {
      // Open initial position
      await tradePage.orderForm.configure({
        side: testCase.openSide,
        marginMode: MarginMode.Cross,
        leverage: DEFAULT_LEVERAGE,
      });

      await tradePage.orderForm.baseInputs.sizeInput.fill(testCase.openSize);
      await tradePage.orderForm.orderSettings.clickSubmitOrder();

      const positionsAfterOpen = await tradePage.positions.getPositions();
      expect.soft(positionsAfterOpen).toHaveLength(1);

      await tradePage.orderForm.configure({
        side: testCase.closeSide,
      });

      await tradePage.orderForm.baseInputs.sizeInput.fill(testCase.reduceSize);
      await tradePage.orderForm.orderSettings.setReduceOnly(true);
      await tradePage.orderForm.orderSettings.clickSubmitOrder();

      const positionsAfterReduce = await tradePage.positions.getPositions();
      expect.soft(positionsAfterReduce).toHaveLength(1);
      expect
        .soft(positionsAfterReduce[0].size)
        .toContain(testCase.expectedRemainingSize);
    });
  }
});
