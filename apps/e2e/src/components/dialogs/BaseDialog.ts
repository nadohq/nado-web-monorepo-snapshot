import { Locator, Page } from '@playwright/test';

/**
 * Base class for all dialog/modal components.
 * Provides a common locator for the close button and a method to close the dialog.
 */
export class BaseDialog {
  readonly closeButton: Locator;
  readonly container: Locator;

  constructor(protected readonly page: Page) {
    this.closeButton = this.page.getByTestId('close-dialog-button');
    this.container = this.page.getByTestId('base-dialog-body');
  }

  /**
   * Closes the dialog by clicking the close button.
   */
  async close(): Promise<void> {
    await this.closeButton.click();
  }
}
