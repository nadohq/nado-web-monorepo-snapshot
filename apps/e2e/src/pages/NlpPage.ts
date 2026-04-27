import { Page } from '@playwright/test';
import { VaultOverview } from 'src/components/nlp/VaultOverview';

/**
 * Page Object Model for the main Nado Liquidity Provider page.
 * Provides access to all UI components via composition.
 */
export class NlpPage {
  protected readonly routePath = '/vault';

  readonly vaultOverview: VaultOverview;

  constructor(private readonly page: Page) {
    this.vaultOverview = new VaultOverview(this.page);
  }

  async goto() {
    await this.page.goto(this.routePath);
  }
}
