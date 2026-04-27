import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';
import {
  ExpectedConditionalOrder,
  OpenOrdersType,
  TpSlOrder,
} from 'src/types/orderTypes';
import { ExpectedPosition, Position } from 'src/types/positionTypes';
import { TpSlInput } from 'src/types/tpslTypes';
import { TODAY } from 'src/utils/date';
import { formatPrice } from 'src/utils/format';

interface MarketOrderWithTpSlTestCase {
  name: string;
  side: BalanceSide;
  marginMode: MarginMode;
  size: string;
  tpsl: TpSlInput;
  /** When true, TP/SL trigger prices are derived from lastPrice × tp/sl multipliers. */
  triggerPricesFromMultipliers?: boolean;
  isSmoke?: boolean;
  expected: {
    position: ExpectedPosition;
    conditionalOrders: ExpectedConditionalOrder[];
  };
}

const DEFAULT_MARKET = 'BTC';
const DEFAULT_SIZE = '0.015';
/** Formatted size as displayed in the UI (5 decimal places with trailing zeros). */
const FORMATTED_SIZE = '0.01500';
const DEFAULT_LEVERAGE = '10';

/** Percentage offset from market price for TP/SL trigger prices. */
const PRICE_OFFSET_PERCENT = 0.05;
/** Larger offset used for modified TP price in management tests. */
const MODIFIED_PRICE_OFFSET_PERCENT = 0.1;

const SIDE_CONFIG = {
  long: {
    direction: 'long',
    tpPriceMultiplier: 1 + PRICE_OFFSET_PERCENT,
    slPriceMultiplier: 1 - PRICE_OFFSET_PERCENT,
  },
  short: {
    direction: 'short',
    tpPriceMultiplier: 1 - PRICE_OFFSET_PERCENT,
    slPriceMultiplier: 1 + PRICE_OFFSET_PERCENT,
  },
} as const;

function buildExpectedPosition(
  side: BalanceSide,
  marginMode: MarginMode,
  market: string,
  formattedSize: string,
): ExpectedPosition {
  const { direction } = SIDE_CONFIG[side];

  return {
    market,
    direction,
    marginMode,
    size: `${formattedSize}\nBTC`,
    value: expect.any(String),
    entryPrice: expect.any(String),
    oraclePrice: expect.any(String),
    estLiqPrice: expect.any(String),
    tpsl: expect.any(String), // Should NOT be 'Add' when TP/SL is set
    estPnl: expect.any(String),
    margin: expect.any(String),
    funding: '+$0.00',
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

/** Build TP/SL with trigger prices from lastPrice × side multipliers. */
function resolveTpslWithMultipliers(
  tpsl: TpSlInput,
  lastPrice: number,
  side: BalanceSide,
): TpSlInput {
  const cfg = SIDE_CONFIG[side];
  const resolved: TpSlInput = {};
  if (tpsl.tp) {
    resolved.tp = {
      ...tpsl.tp,
      triggerPrice: String(Math.round(lastPrice * cfg.tpPriceMultiplier)),
    };
  }
  if (tpsl.sl) {
    resolved.sl = {
      ...tpsl.sl,
      triggerPrice: String(Math.round(lastPrice * cfg.slPriceMultiplier)),
    };
  }
  return resolved;
}

/** Verifies position data and TP/SL trigger price visibility. */
function verifyPosition(
  position: Position,
  expectedPosition: ExpectedPosition,
  resolvedTpsl: TpSlInput,
): void {
  expect.soft(position).toMatchObject(expectedPosition);
  expect.soft(position.tpsl).not.toBe('Add');

  if (resolvedTpsl.tp?.triggerPrice) {
    expect
      .soft(position.tpsl)
      .toContain(formatPrice(resolvedTpsl.tp.triggerPrice));
  }
  if (resolvedTpsl.sl?.triggerPrice) {
    expect
      .soft(position.tpsl)
      .toContain(formatPrice(resolvedTpsl.sl.triggerPrice));
  }
}

/** Verifies TP/SL orders match expected conditional orders and trigger prices. */
function verifyTpSlOrders(
  tpslOrders: TpSlOrder[],
  expectedOrders: ExpectedConditionalOrder[],
  resolvedTpsl: TpSlInput,
): void {
  expect.soft(tpslOrders).toHaveLength(expectedOrders.length);

  for (const expectedOrder of expectedOrders) {
    const orderToMatch: ExpectedConditionalOrder = { ...expectedOrder };

    if (
      expectedOrder.orderType === 'TP Market' &&
      resolvedTpsl.tp?.triggerPrice
    ) {
      orderToMatch.triggerCondition = expect.stringContaining(
        formatPrice(resolvedTpsl.tp.triggerPrice),
      );
    }
    if (
      expectedOrder.orderType === 'SL Market' &&
      resolvedTpsl.sl?.triggerPrice
    ) {
      orderToMatch.triggerCondition = expect.stringContaining(
        formatPrice(resolvedTpsl.sl.triggerPrice),
      );
    }

    expect
      .soft(tpslOrders)
      .toContainEqual(expect.objectContaining(orderToMatch));
  }
}

const TPSL_TEST_CASES: MarketOrderWithTpSlTestCase[] = [
  {
    name: 'long position with TP and SL (% gain/loss)',
    side: 'long',
    marginMode: MarginMode.Cross,
    size: DEFAULT_SIZE,
    isSmoke: true,
    tpsl: {
      tp: { gain: '500' },
      sl: { loss: '500' },
    },
    expected: {
      position: buildExpectedPosition(
        'long',
        MarginMode.Cross,
        DEFAULT_MARKET,
        FORMATTED_SIZE,
      ),
      conditionalOrders: buildExpectedConditionalOrders({
        tp: { gain: '500' },
        sl: { loss: '500' },
      }),
    },
  },
  {
    name: 'short position with TP and SL (% gain/loss)',
    side: 'short',
    marginMode: MarginMode.Cross,
    size: DEFAULT_SIZE,
    isSmoke: true,
    tpsl: {
      tp: { gain: '500' },
      sl: { loss: '500' },
    },
    expected: {
      position: buildExpectedPosition(
        'short',
        MarginMode.Cross,
        DEFAULT_MARKET,
        FORMATTED_SIZE,
      ),
      conditionalOrders: buildExpectedConditionalOrders({
        tp: { gain: '500' },
        sl: { loss: '500' },
      }),
    },
  },
  {
    name: 'long position with TP and SL (trigger prices)',
    side: 'long',
    marginMode: MarginMode.Isolated,
    size: DEFAULT_SIZE,
    triggerPricesFromMultipliers: true,
    tpsl: { tp: {}, sl: {} },
    expected: {
      position: buildExpectedPosition(
        'long',
        MarginMode.Isolated,
        DEFAULT_MARKET,
        FORMATTED_SIZE,
      ),
      conditionalOrders: buildExpectedConditionalOrders({ tp: {}, sl: {} }),
    },
  },
  {
    name: 'long position with TP only',
    side: 'long',
    marginMode: MarginMode.Cross,
    size: DEFAULT_SIZE,
    triggerPricesFromMultipliers: true,
    tpsl: { tp: {} },
    expected: {
      position: buildExpectedPosition(
        'long',
        MarginMode.Cross,
        DEFAULT_MARKET,
        FORMATTED_SIZE,
      ),
      conditionalOrders: buildExpectedConditionalOrders({ tp: {} }),
    },
  },
  {
    name: 'short position with SL only',
    side: 'short',
    marginMode: MarginMode.Cross,
    size: DEFAULT_SIZE,
    triggerPricesFromMultipliers: true,
    tpsl: { sl: {} },
    expected: {
      position: buildExpectedPosition(
        'short',
        MarginMode.Cross,
        DEFAULT_MARKET,
        FORMATTED_SIZE,
      ),
      conditionalOrders: buildExpectedConditionalOrders({ sl: {} }),
    },
  },
];

test.describe('Market Orders with TP/SL', () => {
  // Extended timeout needed for transaction confirmations and dialog interactions
  test.setTimeout(90 * 1000);

  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage?.positions.closeAllPositions();
    await tradePage?.openOrders.cancelAllOpenOrders(OpenOrdersType.TpSl);
  });

  test.afterEach(async () => {
    await tradePage?.openOrders.cancelAllOpenOrders(OpenOrdersType.TpSl);
    await tradePage?.positions.closeAllPositions();
  });

  for (const testCase of TPSL_TEST_CASES) {
    const tag = testCase.isSmoke ? '@smoke' : '';

    test(`opens ${testCase.name} ${tag}`, async () => {
      const useMultipliers = testCase.triggerPricesFromMultipliers === true;
      const lastPrice = useMultipliers
        ? (await tradePage.marketInfoCard.getMarketInfo()).lastPrice
        : 0;
      const resolvedTpsl = useMultipliers
        ? resolveTpslWithMultipliers(testCase.tpsl, lastPrice, testCase.side)
        : testCase.tpsl;

      await tradePage.orderForm.configure({
        side: testCase.side,
        marginMode: testCase.marginMode,
        leverage: DEFAULT_LEVERAGE,
      });

      await tradePage.orderForm.baseInputs.sizeInput.fill(testCase.size);
      await tradePage.orderForm.baseInputs.tpsl.setTpSl(resolvedTpsl);
      await tradePage.orderForm.orderSettings.clickSubmitOrder();
      await tradePage.openOrders.waitForTpSlOrderCount(
        testCase.expected.conditionalOrders.length,
      );

      const [position] = await tradePage.positions.getPositions();
      verifyPosition(position, testCase.expected.position, resolvedTpsl);

      const tpslOrders = await tradePage.openOrders.getTpSlOrders();
      verifyTpSlOrders(
        tpslOrders,
        testCase.expected.conditionalOrders,
        resolvedTpsl,
      );
    });
  }

  test('modifies TP trigger price via Manage TP/SL dialog @smoke', async ({
    page,
  }) => {
    const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
    const initialTpPrice = Math.round(
      lastPrice * SIDE_CONFIG.long.tpPriceMultiplier,
    );
    const modifiedTpPrice = Math.round(
      lastPrice * (1 + MODIFIED_PRICE_OFFSET_PERCENT),
    );

    // Open position with TP
    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });

    await tradePage.orderForm.baseInputs.sizeInput.fill(DEFAULT_SIZE);
    await tradePage.orderForm.baseInputs.tpsl.setTpSl({
      tp: { triggerPrice: initialTpPrice.toString() },
    });
    await tradePage.orderForm.orderSettings.clickSubmitOrder();
    await tradePage.openOrders.waitForTpSlOrderCount(1);

    // Verify initial TP order
    const ordersBefore = await tradePage.openOrders.getTpSlOrders();
    expect.soft(ordersBefore).toHaveLength(1);
    expect
      .soft(ordersBefore[0].triggerCondition)
      .toContain(formatPrice(initialTpPrice));

    // Open Manage TP/SL dialog and modify the TP order
    await tradePage.positions.positionsTab.click();
    const positionRow = tradePage.positions.getPositionRow(0);
    const manageDialog = await positionRow.clickManageTpSl();

    const managedOrders = await manageDialog.getOrders();
    expect.soft(managedOrders).toHaveLength(1);
    expect.soft(managedOrders[0].orderType).toContain('TP');

    const modifyDialog = await manageDialog.modifyOrder(0);
    await modifyDialog.fillTriggerPrice(modifiedTpPrice.toString());
    await modifyDialog.submit();
    await manageDialog.close();

    // Required for the dialog to close and the order to be updated
    await page.waitForTimeout(1000);

    // Verify the TP order now reflects the modified trigger price
    await tradePage.openOrders.waitForTpSlOrderCount(1);
    const ordersAfter = await tradePage.openOrders.getTpSlOrders();

    expect.soft(ordersAfter).toHaveLength(1);
    expect(ordersAfter[0].triggerCondition).toContain(
      formatPrice(modifiedTpPrice),
    );
  });

  test('adds a second TP order via Manage TP/SL dialog', async () => {
    const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
    const firstTpPrice = Math.round(
      lastPrice * SIDE_CONFIG.long.tpPriceMultiplier,
    );
    const secondTpPrice = Math.round(
      lastPrice * (1 + MODIFIED_PRICE_OFFSET_PERCENT),
    );

    // Open position with TP
    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });

    await tradePage.orderForm.baseInputs.sizeInput.fill(DEFAULT_SIZE);
    await tradePage.orderForm.baseInputs.tpsl.setTpSl({
      tp: { triggerPrice: firstTpPrice.toString() },
    });
    await tradePage.orderForm.orderSettings.clickSubmitOrder();
    await tradePage.openOrders.waitForTpSlOrderCount(1);

    // Open Manage TP/SL dialog and add a second TP order
    await tradePage.positions.positionsTab.click();
    const positionRow = tradePage.positions.getPositionRow(0);
    const manageDialog = await positionRow.clickManageTpSl();
    const addDialog = await manageDialog.add();

    await addDialog.fillTpTriggerPrice(secondTpPrice.toString());
    await addDialog.submit();

    // Verify two TP/SL orders now exist
    await tradePage.openOrders.waitForTpSlOrderCount(2);
    const ordersAfter = await tradePage.openOrders.getTpSlOrders();

    expect.soft(ordersAfter).toHaveLength(2);
    expect(ordersAfter.map((o) => o.triggerCondition)).toEqual(
      expect.arrayContaining([
        expect.stringContaining(formatPrice(firstTpPrice)),
        expect.stringContaining(formatPrice(secondTpPrice)),
      ]),
    );
  });

  test('cancels TP order via Manage TP/SL dialog', async () => {
    const { lastPrice } = await tradePage.marketInfoCard.getMarketInfo();
    const tpPrice = Math.round(lastPrice * SIDE_CONFIG.long.tpPriceMultiplier);

    // Open position with TP
    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });

    await tradePage.orderForm.baseInputs.sizeInput.fill(DEFAULT_SIZE);
    await tradePage.orderForm.baseInputs.tpsl.setTpSl({
      tp: { triggerPrice: tpPrice.toString() },
    });
    await tradePage.orderForm.orderSettings.clickSubmitOrder();
    await tradePage.openOrders.waitForTpSlOrderCount(1);

    // Open Manage TP/SL dialog and cancel the TP order
    await tradePage.positions.positionsTab.click();
    const positionRow = tradePage.positions.getPositionRow(0);
    const manageDialog = await positionRow.clickManageTpSl();

    const managedOrders = await manageDialog.getOrders();
    expect.soft(managedOrders).toHaveLength(1);
    expect.soft(managedOrders[0].orderType).toContain('TP');

    await manageDialog.cancelOrder(0);

    await manageDialog.close();

    // Verify the TP/SL order is removed
    await tradePage.openOrders.waitForTpSlOrderCount(0);
    const ordersAfter = await tradePage.openOrders.getTpSlOrders();
    expect(ordersAfter).toHaveLength(0);
  });
});
