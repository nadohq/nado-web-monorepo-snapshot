import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

export class CloseAllPositionsDialog extends BaseDialog {
  readonly closeAllButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    this.closeAllButton = this.container.getByTestId(
      'close-all-positions-action-button',
    );
    this.cancelButton = this.container.getByTestId(
      'close-all-positions-cancel-button',
    );
  }

  async closeAllPositions() {
    await this.closeAllButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
