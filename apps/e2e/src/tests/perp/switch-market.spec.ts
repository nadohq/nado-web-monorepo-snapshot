import { BalanceSide } from '@nadohq/client';
import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { MarginMode } from 'src/types/commonTypes';
import { ExpectedPosition } from 'src/types/positionTypes';

/** Default market loaded on initial page navigation. */
const DEFAULT_MARKET = 'BTC';

/** Target market to switch to via the market switcher UI. */
const TARGET_MARKET = 'XPL';

/** Size of the market order to place after switching. */
const DEFAULT_SIZE = '500';

/** Leverage applied to the order form before placing. */
const DEFAULT_LEVERAGE = '10';

/**
 * Builds an expected position object for assertion via `toMatchObject`.
 * Dynamic fields (value, entryPrice, etc.) use `expect.any(String)`.
 * @param side - The order side (long/short).
 * @param marginMode - The margin mode (Cross/Isolated).
 * @param market - The market name (e.g. "XPL").
 * @param size - The expected formatted size string.
 * @param token - The token symbol (e.g. "XPL").
 * @returns An ExpectedPosition object for use with `toMatchObject`.
 */
function buildExpectedPosition(
  side: BalanceSide,
  marginMode: MarginMode,
  market: string,
  size: string,
  token: string,
): ExpectedPosition {
  return {
    market,
    direction: side,
    marginMode,
    size: `${size}\n${token}`,
    value: expect.any(String),
    entryPrice: expect.any(String),
    oraclePrice: expect.any(String),
    estLiqPrice: expect.any(String),
    tpsl: 'Add',
    estPnl: expect.any(String),
    margin: expect.any(String),
    funding: expect.any(String),
  };
}

test.describe('Switch Market', () => {
  let tradePage: PerpPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    await tradePage.goto();

    await tradePage.positions.closeAllPositions();
  });

  test.afterEach(async () => {
    await tradePage.positions.closeAllPositions();
  });

  test('switches market and places order on correct market @smoke', async ({
    page,
  }) => {
    const currentMarket =
      await tradePage.marketSwitcher.getTriggerMarketContent();
    expect.soft(currentMarket).toContain(`${DEFAULT_MARKET}\nPerp`);

    await tradePage.marketSwitcher.switchToMarket(TARGET_MARKET);
    await page.waitForURL(`**/perpetuals?market=${TARGET_MARKET}`);

    await tradePage.orderForm.configure({
      side: 'long',
      marginMode: MarginMode.Cross,
      leverage: DEFAULT_LEVERAGE,
    });

    const newMarket = await tradePage.marketSwitcher.getTriggerMarketContent();
    expect.soft(newMarket).toContain(`${TARGET_MARKET}\nPerp`);

    await tradePage.orderForm.baseInputs.sizeInput.fill(DEFAULT_SIZE);
    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    await tradePage.positions.waitForPositionCount(1);
    const [position] = await tradePage.positions.getPositions();

    const expectedPosition = buildExpectedPosition(
      'long',
      MarginMode.Cross,
      TARGET_MARKET,
      DEFAULT_SIZE,
      'XPL',
    );

    expect(position).toMatchObject(expectedPosition);
  });
});
