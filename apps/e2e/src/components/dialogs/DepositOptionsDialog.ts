import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

export class DepositOptionsDialog extends BaseDialog {
  readonly chainSelect: Locator;
  readonly assetSelect: Locator;
  readonly connectedWalletButton: Locator;

  constructor(page: Page) {
    super(page);

    this.chainSelect = this.page.getByTestId(
      'deposit-options-dialog-deposit-chain-select',
    );
    this.assetSelect = this.page.getByTestId(
      'deposit-options-dialog-deposit-asset-select',
    );
    this.connectedWalletButton = this.page.getByTestId(
      'deposit-options-dialog-deposit-from-connected-wallet',
    );
  }

  async selectChain(option: string) {
    await this.chainSelect.click();
    await this.page
      .getByTestId(`deposit-option-${option}-select-option`)
      .click();
  }

  async selectAsset(option: string) {
    await this.assetSelect.click();
    await this.page
      .getByTestId(`deposit-option-${option}-select-option`)
      .click();
  }

  async selectWalletDeposit() {
    await this.connectedWalletButton.click();
  }
}
