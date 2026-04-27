import { Locator, Page } from '@playwright/test';

export class ErrorPage {
  readonly page: Page;
  readonly statusCode: Locator;
  readonly statusMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.statusCode = page.getByTestId('error-page-status-code');
    this.statusMessage = page.getByTestId('error-page-status-message');
  }

  async isErrorPage(): Promise<boolean> {
    return (
      (await this.statusCode.isVisible()) &&
      (await this.statusMessage.isVisible())
    );
  }
}
