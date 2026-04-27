import { Locator, Page } from '@playwright/test';

export class CookieBanner {
  readonly acceptAllButton: Locator;

  constructor(private readonly page: Page) {
    this.acceptAllButton = this.page.getByTestId(
      'cookie-notice-banner-accept-all-button',
    );
  }

  async acceptAll(): Promise<void> {
    await this.acceptAllButton.click();
  }
}
