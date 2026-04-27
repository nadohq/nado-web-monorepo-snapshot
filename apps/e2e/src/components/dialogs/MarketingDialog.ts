import { Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

/**
 * Handles optional marketing/promotional dialogs that may appear randomly.
 * Uses soft checks - doesn't fail if dialog is not present.
 */
export class MarketingDialog extends BaseDialog {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Dismisses all marketing dialogs if they appear within the timeout.
   * Does nothing if no dialogs appear - this is expected behavior.
   *
   * @param timeout - Max time to wait for dialogs to appear (default: 2000ms)
   */
  async dismissIfVisible(timeout = 2000): Promise<void> {
    // Wait for potential dialogs to appear
    try {
      await this.closeButton.first().waitFor({ state: 'visible', timeout });
    } catch {
      // No dialogs appeared - this is fine
      return;
    }

    // Count and close all visible dialogs
    const dialogCount = await this.closeButton.count();

    for (let i = 0; i < dialogCount; i++) {
      await this.closeButton.first().click();
    }
  }
}
