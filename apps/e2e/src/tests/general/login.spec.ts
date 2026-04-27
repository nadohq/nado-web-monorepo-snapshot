import { expect, test } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';

test.describe('Authentication', () => {
  test.use({ useFreshSession: true });

  test('connects wallet via browser extension @smoke', async ({
    page,
    walletAddress,
  }) => {
    const tradePage = new PerpPage(page);

    await tradePage.goto();

    await tradePage.navbar.clickConnectWallet();
    await tradePage.connectWalletDialog.selectBrowserExtension();
    await tradePage.onboardingDialog.agreeToTermsButton.waitFor({
      state: 'visible',
    });

    await tradePage.onboardingDialog.agreeToTerms();
    await tradePage.onboardingDialog.startTrading();

    await tradePage.marketingDialog.dismissIfVisible();

    await tradePage.toast.dismissAll();
    await tradePage.cookieBanner.acceptAll();
    await tradePage.tutorialPopover.dismissPermanently();

    // Trigger approve trading flow
    await tradePage.orderForm.orderSettings.clickSubmitOrder();
    await tradePage.oneClickTradingDialog.approve();

    // Verify connected wallet address
    await tradePage.navbar.openAccountDropdown();
    await tradePage.accountDropdown.copyAddress();

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardText).toBe(walletAddress);
  });
});
