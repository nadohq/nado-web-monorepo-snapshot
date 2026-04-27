import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';
import { MarginMode } from 'src/types/commonTypes';

export class MarginModeDialog extends BaseDialog {
  readonly confirmButton: Locator;
  readonly isolatedButton: Locator;
  readonly crossButton: Locator;

  constructor(page: Page) {
    super(page);

    this.isolatedButton = this.container.getByTestId(
      'perp-margin-mode-dialog-isolated-button',
    );
    this.crossButton = this.container.getByTestId(
      'perp-margin-mode-dialog-cross-button',
    );

    this.confirmButton = this.container.getByTestId(
      'perp-margin-mode-dialog-confirm-button',
    );
  }

  async selectMarginMode(mode: MarginMode) {
    if (mode === MarginMode.Isolated) {
      await this.isolatedButton.click();
    } else {
      await this.crossButton.click();
    }

    await this.confirmButton.click();
  }
}
