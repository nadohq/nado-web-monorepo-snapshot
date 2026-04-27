import { Locator, Page } from '@playwright/test';
import { getNumberFromText } from 'src/utils/format';

export interface SpotMarketInfo {
  lastPrice: number;
  change24h: {
    value: number;
    percentage: number;
  };
  volume24h: number;
  borrowRate: number;
}

/**
 * Page object for the Spot Market Info bar.
 * Provides access to last price, 24h change, 24h volume, and borrow rate.
 */
export class SpotMarketInfoCard {
  readonly lastPrice: Locator;
  readonly change24h: Locator;
  readonly volume24h: Locator;
  readonly borrowRate: Locator;

  constructor(page: Page) {
    this.lastPrice = page.getByTestId('spot-market-info-last-price');
    this.change24h = page.getByTestId('spot-market-info-24h-change');
    this.volume24h = page.getByTestId('spot-market-info-24h-volume');
    this.borrowRate = page.getByTestId('spot-market-info-borrow-rate');
  }

  async getLastPrice(): Promise<number> {
    const text = await this.lastPrice.innerText();

    return getNumberFromText(text);
  }

  async getMarketInfo(): Promise<SpotMarketInfo> {
    const [lastPriceText, change24hText, volume24hText, borrowRateText] =
      await Promise.all([
        this.lastPrice.innerText(),
        this.change24h.innerText(),
        this.volume24h.innerText(),
        this.borrowRate.innerText(),
      ]);

    const [changeValStr, changePercStr] = change24hText.split('(');

    return {
      lastPrice: getNumberFromText(lastPriceText),
      change24h: {
        value: getNumberFromText(changeValStr),
        percentage: getNumberFromText(changePercStr),
      },
      volume24h: getNumberFromText(volume24hText),
      borrowRate: getNumberFromText(borrowRateText),
    };
  }
}
