import * as fs from 'fs';

import { STORAGE_STATE_PATH } from 'src/fixtures/consts';
import { test as setup } from 'src/fixtures/web3Fixture';
import { PerpPage } from 'src/pages/PerpPage';

setup('authenticate and accept terms', async ({ page, context }) => {
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    setup.skip(true, 'Auth state already present');
    return;
  }

  const tradePage = new PerpPage(page);

  // 1. Navigate and dismiss any marketing dialogs
  await tradePage.goto();

  // 2. Connect wallet
  await tradePage.navbar.clickConnectWallet();
  await tradePage.connectWalletDialog.selectBrowserExtension();

  await page.waitForTimeout(500);

  // 3. Accept terms of service and start trading
  await tradePage.onboardingDialog.agreeToTerms();
  await tradePage.onboardingDialog.startTrading();

  // 4. Dismiss marketing dialogs
  await tradePage.marketingDialog.dismissIfVisible();

  // 5. Dismiss initial notification toast
  await tradePage.toast.dismissAll();

  // 6. Accept cookies
  await tradePage.cookieBanner.acceptAll();

  // 7. Dismiss tutorial
  await tradePage.tutorialPopover.dismissPermanently();

  // 8. Approve 1-click trading
  // NOTE: This flow assumes an account with existing deposits. Fresh accounts
  // require a deposit step before this point (to be implemented).
  await page.getByTestId('order-placement-submit-button').click();

  if (await tradePage.oneClickTradingDialog.createKeyButton.isVisible()) {
    // Two-step 1CT flow: create signing key, then link it on-chain
    // 1. Create the signing key
    await tradePage.oneClickTradingDialog.createKey();
    // 2. Enable 1CT, this will link the signing key on-chain
    await tradePage.oneClickTradingDialog.enable1CT();
  } else {
    await tradePage.oneClickTradingDialog.approve();
  }

  await page.waitForTimeout(3000);

  // 9. Save storage state for reuse in tests
  await context.storageState({ path: STORAGE_STATE_PATH });
});
