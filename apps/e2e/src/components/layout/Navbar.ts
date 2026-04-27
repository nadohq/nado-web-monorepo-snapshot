import { Locator, Page } from '@playwright/test';

export class Navbar {
  readonly connectWalletButton: Locator;
  readonly walletDisplayName: Locator;

  constructor(private readonly page: Page) {
    this.connectWalletButton = this.page.getByTestId(
      'navbar-connect-wallet-button',
    );
    this.walletDisplayName = this.page.getByTestId(
      'navbar-wallet-display-name',
    );
  }

  async clickConnectWallet(): Promise<void> {
    await this.connectWalletButton.click();
  }

  async openAccountDropdown(): Promise<void> {
    await this.walletDisplayName.click();
  }
}
