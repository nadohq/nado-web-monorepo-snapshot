import { Locator, Page } from '@playwright/test';
import { CollateralWithdrawDialog } from 'src/components/dialogs/CollateralWithdrawDialog';
import { DepositOptionsDialog } from 'src/components/dialogs/DepositOptionsDialog';
import { WalletDepositDialog } from 'src/components/dialogs/WalletDepositDialog';

export class CollateralButtons {
  readonly transferButton: Locator;
  readonly withdrawButton: Locator;
  readonly depositButton: Locator;

  constructor(private readonly page: Page) {
    this.transferButton = this.page.getByTestId(
      'portfolio-collateral-buttons-transfer',
    );
    this.withdrawButton = this.page.getByTestId(
      'portfolio-collateral-buttons-withdraw',
    );
    this.depositButton = this.page.getByTestId(
      'portfolio-collateral-buttons-deposit',
    );
  }

  async openTransferDialog() {
    await this.transferButton.click();
  }

  async openWithdrawDialog(): Promise<CollateralWithdrawDialog> {
    await this.withdrawButton.click();
    return new CollateralWithdrawDialog(this.page);
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
}
