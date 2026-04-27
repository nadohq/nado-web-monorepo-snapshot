import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

export class ClosePositionDialog extends BaseDialog {
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.submitButton = this.container.getByTestId(
      'close-position-dialog-close-button',
    );
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
