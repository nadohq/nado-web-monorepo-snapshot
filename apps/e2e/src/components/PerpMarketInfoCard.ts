import { Locator, Page } from '@playwright/test';
import { getNumberFromText } from 'src/utils/format';

export interface MarketInfo {
  lastPrice: number;
  oraclePrice: number;
  indexPrice: number;
  change24h: {
    value: number;
    percentage: number;
  };
  volume24h: number;
  openInterest: number;
  fundingRate: number;
  countdown: string;
  estAnnFunding: number;
}

export class PerpMarketInfoCard {
  readonly container: Locator;
  readonly lastPrice: Locator;
  readonly oraclePrice: Locator;
  readonly indexPrice: Locator;
  readonly change24h: Locator;
  readonly volume24h: Locator;
  readonly openInterest: Locator;
  readonly fundingRate: Locator;
  readonly countdown: Locator;
  readonly estAnnFunding: Locator;

  constructor(page: Page) {
    this.container = page
      .locator('div.overflow-x-auto.overflow-y-hidden')
      .first();
    this.lastPrice = page.getByTestId('perp-market-info-last-price');
    this.oraclePrice = page.getByTestId('perp-market-info-oracle-price');
    this.indexPrice = page.getByTestId('perp-market-info-index-price');
    this.change24h = page.getByTestId('perp-market-info-24h-change');
    this.volume24h = page.getByTestId('perp-market-info-24h-volume');
    this.openInterest = page.getByTestId('perp-market-info-open-interest');
    this.fundingRate = page.getByTestId('perp-market-info-est-funding-1h');
    this.countdown = page.getByTestId('perp-market-info-countdown');
    this.estAnnFunding = page.getByTestId('perp-market-info-est-ann-funding');
  }

  async getMarketInfo(): Promise<MarketInfo> {
    const [
      lastPriceText,
      oraclePriceText,
      indexPriceText,
      change24hText,
      volume24hText,
      openInterestText,
      fundingRateText,
      countdownText,
      estAnnFundingText,
    ] = await Promise.all([
      this.lastPrice.innerText(),
      this.oraclePrice.innerText(),
      this.indexPrice.innerText(),
      this.change24h.innerText(),
      this.volume24h.innerText(),
      this.openInterest.innerText(),
      this.fundingRate.innerText(),
      this.countdown.innerText(),
      this.estAnnFunding.innerText(),
    ]);

    const [changeValStr, changePercStr] = change24hText.split('(');

    return {
      lastPrice: getNumberFromText(lastPriceText),
      oraclePrice: getNumberFromText(oraclePriceText),
      indexPrice: getNumberFromText(indexPriceText),
      change24h: {
        value: getNumberFromText(changeValStr),
        percentage: getNumberFromText(changePercStr),
      },
      volume24h: getNumberFromText(volume24hText),
      openInterest: getNumberFromText(openInterestText),
      fundingRate: getNumberFromText(fundingRateText),
      countdown: countdownText.trim(),
      estAnnFunding: getNumberFromText(estAnnFundingText),
    };
  }
}
