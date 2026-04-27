import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

/** Header metrics shared across all TP/SL dialog variants. */
export interface TpSlHeaderMetrics {
  market: string;
  lastPrice: string;
  entryPrice: string;
  estLiqPrice: string;
}

/**
 * Base class for TP/SL dialog components (Add, Modify).
 * Extracts shared header metrics locators and retrieval logic.
 */
export class BaseTpSlDialog extends BaseDialog {
  readonly market: Locator;
  readonly lastPrice: Locator;
  readonly entryPrice: Locator;
  readonly estLiqPrice: Locator;

  constructor(page: Page) {
    super(page);

    this.market = this.container.getByTestId('tpsl-header-metrics-market');
    this.lastPrice = this.container.getByTestId(
      'tpsl-header-metrics-last-price',
    );
    this.entryPrice = this.container.getByTestId(
      'tpsl-header-metrics-entry-price',
    );
    this.estLiqPrice = this.container.getByTestId(
      'tpsl-header-metrics-estimated-liquidation-price',
    );
  }

  /**
   * Retrieves the header metrics displayed at the top of the dialog.
   * @returns Promise resolving to the header metrics (market, lastPrice, entryPrice, estLiqPrice).
   */
  async getHeaderMetrics(): Promise<TpSlHeaderMetrics> {
    const [market, lastPrice, entryPrice, estLiqPrice] = await Promise.all([
      this.market.innerText(),
      this.lastPrice.innerText(),
      this.entryPrice.innerText(),
      this.estLiqPrice.innerText(),
    ]);

    return {
      market: market.trim(),
      lastPrice: lastPrice.trim(),
      entryPrice: entryPrice.trim(),
      estLiqPrice: estLiqPrice.trim(),
    };
  }
}
