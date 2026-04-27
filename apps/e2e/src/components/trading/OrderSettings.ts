import { Locator, Page } from '@playwright/test';

export class OrderSettings {
  private page: Page;

  readonly reduceOnlyCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.reduceOnlyCheckbox = this.page.getByTestId(
      'order-settings-reduce-only-checkbox',
    );

    this.submitButton = this.page.getByTestId('order-placement-submit-button');
  }

  async setReduceOnly(enabled: boolean) {
    await this.reduceOnlyCheckbox.setChecked(enabled);
  }

  async clickSubmitOrder() {
    await this.submitButton.click();
    // Wait for order execution confirmation
    await this.page.waitForTimeout(2000);
  }
}
