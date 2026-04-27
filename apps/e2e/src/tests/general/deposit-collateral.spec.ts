import { expect, test } from 'src/fixtures/web3Fixture';
import { PortfolioPage } from 'src/pages/PortfolioPage';
import { getNumberFromText } from 'src/utils/format';

const DEPOSIT_AMOUNT = '1';

test.describe('Collateral Deposit', () => {
  let portfolioPage: PortfolioPage;

  test.beforeEach(async ({ page }) => {
    portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();
  });

  test('deposits USDT0 via wallet deposit dialog @smoke', async ({ page }) => {
    const initialBalance =
      await portfolioPage.overviewTable.findBySymbol('USDT0');

    expect.soft(initialBalance).toBeDefined();

    const depositDialog =
      await portfolioPage.collateralButtons.openWalletDepositDialog();

    await depositDialog.fillAmount(DEPOSIT_AMOUNT);
    await depositDialog.submit();
    await depositDialog.waitForSuccess();
    await depositDialog.close();

    await page.waitForTimeout(5_000);

    const updatedBalance =
      await portfolioPage.overviewTable.findBySymbol('USDT0');

    expect.soft(updatedBalance).toBeDefined();
    expect(getNumberFromText(updatedBalance!.amount)).toBeGreaterThan(
      getNumberFromText(initialBalance!.amount),
    );
  });
});
