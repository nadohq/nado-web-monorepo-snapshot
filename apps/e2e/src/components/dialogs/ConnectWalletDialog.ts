import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

export class ConnectWalletDialog extends BaseDialog {
  readonly injectedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.injectedButton = this.container.getByTestId(
      'connect-wallet-dialog-injected-button',
    );
  }

  async selectBrowserExtension(): Promise<void> {
    await this.injectedButton.click();
  }
}
