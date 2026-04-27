import { Locator, Page } from '@playwright/test';
import { CollateralWithdrawDialog } from 'src/components/dialogs/CollateralWithdrawDialog';
import { DepositOptionsDialog } from 'src/components/dialogs/DepositOptionsDialog';
import { WalletDepositDialog } from 'src/components/dialogs/WalletDepositDialog';

export class AccountCard {
  readonly depositButton: Locator;
  readonly withdrawButton: Locator;

  constructor(private readonly page: Page) {
    this.depositButton = this.page.getByTestId('account-deposit-button');
    this.withdrawButton = this.page.getByTestId('account-withdraw-button');
  }

  async openWalletDepositDialog(
    chain = 'ink-sepolia',
    asset = 'usdt0',
  ): Promise<WalletDepositDialog> {
    await this.depositButton.click();

    const optionsDialog = new DepositOptionsDialog(this.page);
    await optionsDialog.selectChain(chain);
    await optionsDialog.selectAsset(asset);
    await optionsDialog.selectWalletDeposit();

    return new WalletDepositDialog(this.page);
  }

  async openWithdrawDialog(): Promise<CollateralWithdrawDialog> {
    await this.withdrawButton.click();
    return new CollateralWithdrawDialog(this.page);
  }

  async deposit(amount: string) {
    const dialog = await this.openWalletDepositDialog();
    await dialog.fillAmount(amount);
    await dialog.submit();
    await dialog.waitForSuccess();
    await dialog.close();
  }

  async withdraw(amount: string) {
    const dialog = await this.openWithdrawDialog();
    await dialog.fillAmount(amount);
    await dialog.submit();
    await dialog.waitForSuccess();
    await dialog.close();
  }
}
