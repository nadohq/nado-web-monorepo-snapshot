import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

export class OneClickTradingDialog extends BaseDialog {
  readonly approveButton: Locator;
  readonly createKeyButton: Locator;
  readonly enable1CTButton: Locator;

  constructor(page: Page) {
    super(page);
    this.approveButton = this.container.getByTestId(
      'single-signature-reapproval-submit-button',
    );
    this.createKeyButton = this.container.getByTestId(
      'signature-mode-create-key-button',
    );
    this.enable1CTButton = this.container.getByTestId(
      'signature-mode-enable-1ct-submit-button',
    );
  }

  async approve(): Promise<void> {
    await this.approveButton.click();
  }

  async createKey(): Promise<void> {
    await this.createKeyButton.click();
  }

  async enable1CT(): Promise<void> {
    await this.enable1CTButton.click();
  }
}
