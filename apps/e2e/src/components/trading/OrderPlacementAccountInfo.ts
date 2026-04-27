import { Locator, Page } from '@playwright/test';
import { getNumberFromText } from 'src/utils/format';

/**
 * Page object for the order placement account info section.
 *
 * Renders two rows:
 * - **Available Margin** — USD value (shared between perp and spot)
 * - **Position** (perp) / **Balance** (spot) — asset amount button
 */
export class OrderPlacementAccountInfo {
  readonly availableMargin: Locator;
  readonly positionAmount: Locator;

  constructor(page: Page) {
    this.availableMargin = page.getByTestId('order-placement-available-margin');
    this.positionAmount = page.getByTestId('order-placement-position-amount');
  }

  /**
   * Returns the position/balance amount as a number
   * (e.g. "1.00125 kBTC" → 1.00125, "0.000 XAUT" → 0).
   */
  async getAmount(): Promise<number> {
    const text = await this.positionAmount.innerText();
    return getNumberFromText(text);
  }
}
