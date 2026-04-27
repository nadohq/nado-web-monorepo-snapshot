import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';
import { PortfolioPage } from 'src/pages/PortfolioPage';

const WITHDRAW_AMOUNT = '2';

test.describe('Collateral Withdraw', () => {
  let tradePage: PerpPage;
  let portfolioPage: PortfolioPage;

  test.beforeEach(async ({ page }) => {
    tradePage = new PerpPage(page);
    portfolioPage = new PortfolioPage(page);
    await tradePage.goto();
  });

  test('withdraws USDT0 via withdraw dialog @smoke', async ({ page }) => {
    const withdrawDialog = await tradePage.accountCard.openWithdrawDialog();

    await page.waitForTimeout(250);
    await withdrawDialog.fillAmount(WITHDRAW_AMOUNT);
    await withdrawDialog.submit();
    await withdrawDialog.clickTrackStatusButton();

    const withdrawal =
      await portfolioPage.withdrawalHistoryTable.getLastWithdrawal();

    expect(withdrawal).toMatchObject({
      asset: 'USDT0',
      amount: '2.0000\nUSDT0',
      value: '$2.00',
      status: 'Processing',
    });
  });
});
