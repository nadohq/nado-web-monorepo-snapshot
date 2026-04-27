import { Locator } from '@playwright/test';

import { ToastData } from 'src/types/commonTypes';

/**
 * Represents a single visible toast notification.
 */
export class NotificationToastItem {
  readonly container: Locator;
  readonly header: Locator;
  readonly body: Locator;
  readonly dismissButton: Locator;

  constructor(container: Locator) {
    this.container = container;
    this.header = container.getByTestId('toast-header');
    this.body = container.getByTestId('toast-body');
    this.dismissButton = container.getByTestId('toast-dismiss-button');
  }

  /**
   * Checks if the toast item exists and is visible.
   */
  async exists(): Promise<boolean> {
    return await this.container.isVisible();
  }

  /**
   * Retrieves the title and description of the toast.
   */
  async getDetails(): Promise<ToastData> {
    const [title, description] = await Promise.all([
      this.header.innerText(),
      this.body.innerText(),
    ]);

    return {
      title: title.trim(),
      description: description.trim(),
    };
  }

  /**
   * Dismisses the toast notification.
   */
  async dismiss(): Promise<void> {
    await this.dismissButton.click();
  }
}
