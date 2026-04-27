import { expect, test } from 'src/fixtures/web3Fixture';
import { NlpPage } from 'src/pages/NlpPage';

test.describe('Nado Liquidity Provider - NLP', () => {
  let nlpPage: NlpPage;

  test.beforeEach(async ({ page }) => {
    nlpPage = new NlpPage(page);
    await nlpPage.goto();
    await page.waitForTimeout(3000);
  });

  test('deposit to NLP Vault @smoke', async ({ page }) => {
    const vaultDataBefore = await nlpPage.vaultOverview.getVaultData();

    await nlpPage.vaultOverview.deposit('5');
    await page.waitForTimeout(1000);

    const vaultDataAfter = await nlpPage.vaultOverview.getVaultData();

    expect(vaultDataAfter.positionValue).toBeGreaterThan(
      vaultDataBefore.positionValue,
    );
    expect(vaultDataAfter.balanceValue).toBeGreaterThanOrEqual(
      vaultDataBefore.balanceValue,
    );
  });
});
