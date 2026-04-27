import { Locator, Page } from '@playwright/test';

export class AccountDropdown {
  readonly copyAddressButton: Locator;

  constructor(private readonly page: Page) {
    this.copyAddressButton = this.page.getByTestId(
      'navbar-account-dropdown-copy-address-button',
    );
  }

  async copyAddress(): Promise<void> {
    await this.copyAddressButton.click();
  }
}
