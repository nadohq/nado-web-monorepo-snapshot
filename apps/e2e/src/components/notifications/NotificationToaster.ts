import { Locator, Page } from '@playwright/test';

import { NotificationToastItem } from 'src/components/notifications/NotificationToastItem';
import { ToastData } from 'src/types/commonTypes';

/**
 * Page object for the toast notification system (Toaster).
 * Handles global actions like dismissing all toasts or waiting for a specific one.
 */
export class NotificationToaster {
  readonly page: Page;
  readonly toastLocators: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toastLocators = page.getByTestId('toast-container');
  }

  /**
   * Returns the number of currently visible toasts.
   */
  async count(): Promise<number> {
    return await this.toastLocators.count();
  }

  /**
   * Returns a NotificationToastItem component for the toast at the given index.
   */
  getToastItem(index: number): NotificationToastItem {
    return new NotificationToastItem(this.toastLocators.nth(index));
  }

  /**
   * Dismisses all currently visible toasts.
   */
  async dismissAll(): Promise<void> {
    const count = await this.count();
    // Always dismiss the first one since the list updates after each click
    for (let i = 0; i < count; i++) {
      await this.getToastItem(0).dismiss();
    }
  }

  /**
   * Retrieves data for all currently visible toasts.
   */
  async getAll(): Promise<ToastData[]> {
    const count = await this.count();
    const toasts: ToastData[] = [];

    for (let i = 0; i < count; i++) {
      toasts.push(await this.getToastItem(i).getDetails());
    }

    return toasts;
  }

  /**
   * Finds a toast by title if it exists among currently visible toasts.
   */
  async getByTitle(title: string): Promise<ToastData | undefined> {
    const toasts = await this.getAll();
    return toasts.find((t) => t.title.includes(title));
  }

  /**
   * Waits for a toast with the specific title to become visible and returns its data.
   */
  async waitForToast(title: string, timeout = 5000): Promise<ToastData> {
    const toastLocator = this.toastLocators.filter({ hasText: title }).first();
    await toastLocator.waitFor({ state: 'visible', timeout });

    return await new NotificationToastItem(toastLocator).getDetails();
  }
}
