import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';
import { ExpectedPosition } from 'src/types/positionTypes';

interface MarketOrderTestCase {
  name: string;
  side: BalanceSide;
  marginMode: MarginMode;
  size: string;
  isSmoke?: boolean;
  expected: {
    position: ExpectedPosition;
  };
}

const DEFAULT_MARKET = 'BTC';
const DEFAULT_SIZE = '0.0001';
const FORMATTED_SIZE = '0.00010';
const DEFAULT_LEVERAGE = '10';

const SIDES: BalanceSide[] = ['long', 'short'];
const MARGIN_MODES = [MarginMode.Cross, MarginMode.Isolated] as const;

const SIDE_CONFIG = {
  long: {
    direction: 'long',
    toastAction: 'bought',
    positionLabel: 'long',
  },
  short: {
    direction: 'short',
    toastAction: 'sold',
    positionLabel: 'short',
  },
} as const;

const MARGIN_MODE_CONFIG: Record<
  MarginMode,
  {
    label: string;
    description: string;
    estLiqPrice: ReturnType<typeof expect.any>;
  }
> = {
  [MarginMode.Cross]: {
    label: 'Cross Margin',
    description: 'shared collateral',
    estLiqPrice: expect.any(String),
  },
  [MarginMode.Isolated]: {
    label: 'Isolated Margin',
    description: 'segregated margin',
    estLiqPrice: expect.any(String),
  },
};

function buildExpectedPosition(
  side: BalanceSide,
  marginMode: MarginMode,
  market: string,
  formattedSize: string,
): ExpectedPosition {
  const { direction } = SIDE_CONFIG[side];
  const { estLiqPrice } = MARGIN_MODE_CONFIG[marginMode];

  return {
    market,
    direction,
    marginMode,
    size: `${formattedSize}\nBTC`,
    value: expect.any(String),
    entryPrice: expect.any(String),
    oraclePrice: expect.any(String),
    estLiqPrice,
    tpsl: 'Add',
    estPnl: expect.any(String),
    margin: expect.any(String),
    funding: '+$0.00',
  };
}

function buildTestCase(
  side: BalanceSide,
  marginMode: MarginMode,
): MarketOrderTestCase {
  const { positionLabel } = SIDE_CONFIG[side];
  const { label, description } = MARGIN_MODE_CONFIG[marginMode];

  return {
    name: `${positionLabel} position (${label}) with ${description}`,
    side,
    marginMode,
    size: DEFAULT_SIZE,
    expected: {
      position: buildExpectedPosition(
        side,
        marginMode,
        DEFAULT_MARKET,
        FORMATTED_SIZE,
      ),
    },
  };
}

const MARKET_ORDER_TEST_CASES: MarketOrderTestCase[] = SIDES.flatMap((side) =>
  MARGIN_MODES.map((marginMode) => ({
    ...buildTestCase(side, marginMode),
    isSmoke:
      (side === 'long' && marginMode === MarginMode.Cross) ||
      (side === 'short' && marginMode === MarginMode.Isolated),
  })),
);

test.describe('Market Orders', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
  });

  test.afterEach(async () => {
    await tradePage.positions.closeAllPositions();
  });

  for (const testCase of MARKET_ORDER_TEST_CASES) {
    const tag = testCase.isSmoke ? '@smoke' : '';

    test(`opens ${testCase.name} ${tag}`, async () => {
      await tradePage.orderForm.configure({
        side: testCase.side,
        marginMode: testCase.marginMode,
        leverage: DEFAULT_LEVERAGE,
      });

      await tradePage.orderForm.baseInputs.sizeInput.fill(testCase.size);
      await tradePage.orderForm.orderSettings.clickSubmitOrder();

      await tradePage.positions.waitForPositionCount(1);

      const [position] = await tradePage.positions.getPositions();

      expect(position).toMatchObject(testCase.expected.position);
    });
  }
});
