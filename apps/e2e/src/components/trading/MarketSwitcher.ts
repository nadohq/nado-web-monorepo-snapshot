import { Locator, Page } from '@playwright/test';
import { getNumberFromText } from 'src/utils/format';

/** Available market category filter options in the switcher. */
export type MarketCategory =
  | 'all'
  | 'perps'
  | 'spot'
  | 'memes'
  | 'defi'
  | 'chains'
  | 'commodities';

/** Parsed data for a single row in the market switcher table. */
export interface MarketSwitcherRowData {
  /** Market name (e.g. "BTC"). */
  marketName: string;
  /** Max leverage (e.g. "40x"). */
  leverage: string;
  /** Product type (e.g. "Perp"). */
  productType: string;
  /** Current market price (e.g. "68,060"). */
  currentPrice: string;
  /** 24h price change percentage (e.g. "−1.98%"). */
  priceChangeFrac: string;
  /** 24h trading volume (e.g. "198,005,840"). */
  volume24h: string;
  /** Annualized funding rate (e.g. "−18.41%"). */
  annualizedFunding: string;
}

/**
 * Represents a single row in the market switcher table.
 * Encapsulates locators for cells within the row.
 */
export class MarketSwitcherRow {
  /** Market name cell (e.g. "BTC"). Uses starts-with selector for unique per-market data-testid. */
  readonly marketName: Locator;
  /** Max leverage pill (e.g. "40x"). */
  readonly leverage: Locator;
  /** Product type pill (e.g. "Perp"). */
  readonly productType: Locator;
  /** Current market price. */
  readonly currentPrice: Locator;
  /** 24h price change percentage (e.g. "−1.98%"). */
  readonly priceChangeFrac: Locator;
  /** 24h trading volume. */
  readonly volume24h: Locator;
  /** Annualized funding rate. */
  readonly annualizedFunding: Locator;
  /** Favorite toggle (star) button. */
  readonly favoriteToggle: Locator;

  /** @param row - The row `<a>` element locator scoped to a single market row. */
  constructor(readonly row: Locator) {
    this.marketName = row.locator(
      '[data-testid^="trading-market-switcher-market-name-cell-"]',
    );
    this.leverage = row.getByTestId(
      'trading-market-switcher-market-leverage-cell',
    );
    this.productType = row.getByTestId(
      'trading-market-switcher-product-type-pill',
    );
    this.currentPrice = row.getByTestId(
      'trading-market-switcher-current-price-cell',
    );
    this.priceChangeFrac = row.getByTestId(
      'trading-market-switcher-price-change-frac-cell',
    );
    this.volume24h = row.getByTestId('trading-market-switcher-volume-24h-cell');
    this.annualizedFunding = row.getByTestId(
      'trading-market-switcher-annualized-funding-cell',
    );
    this.favoriteToggle = row.getByTestId(
      'trading-market-switcher-favorite-toggle-cell',
    );
  }

  /**
   * Parses all cell values from this row into structured data.
   * @returns Parsed market row data.
   */
  async getData(): Promise<MarketSwitcherRowData> {
    const [
      marketName,
      leverage,
      productType,
      currentPrice,
      priceChangeFrac,
      volume24h,
      annualizedFunding,
    ] = await Promise.all([
      this.marketName.innerText(),
      this.leverage.innerText(),
      this.productType.innerText(),
      this.currentPrice.innerText(),
      this.priceChangeFrac.innerText(),
      this.volume24h.innerText(),
      this.annualizedFunding.innerText(),
    ]);

    return {
      marketName: marketName.trim(),
      leverage: leverage.trim(),
      productType: productType.trim(),
      currentPrice: currentPrice.trim(),
      priceChangeFrac: priceChangeFrac.trim(),
      volume24h: volume24h.trim(),
      annualizedFunding: annualizedFunding.trim(),
    };
  }

  /**
   * Clicks the row to navigate to the market.
   */
  async click(): Promise<void> {
    await this.row.click();
  }

  /**
   * Toggles the favorite status of this market row.
   */
  async toggleFavorite(): Promise<void> {
    await this.favoriteToggle.click();
  }
}

/**
 * Page Object Model for the Trading Market Switcher popover.
 * Provides access to the trigger, search box, category filters,
 * and the market table rows with their cell data.
 */
export class MarketSwitcher {
  readonly page: Page;
  /** Popover trigger button that opens the market switcher dropdown. */
  readonly trigger: Locator;
  /** Market name and product type content displayed in the trigger (e.g. "BTC Perp"). */
  readonly triggerMarketContent: Locator;
  /** Search input inside the popover for filtering markets. */
  readonly searchBox: Locator;
  /** Scrollable table container holding all market rows. */
  readonly table: Locator;

  /** @param page - The Playwright Page instance. */
  constructor(page: Page) {
    this.page = page;
    this.trigger = this.page.getByTestId('trading-market-switcher-trigger');
    this.triggerMarketContent = this.page.getByTestId(
      'trading-market-switcher-trigger-market-content',
    );
    this.searchBox = this.page.getByTestId(
      'trading-market-switcher-search-box',
    );
    this.table = this.page.getByTestId('trading-market-switcher-desktop-table');
  }

  /**
   * Parses a price change string (e.g. "+1.23%" or "−2.04%") into a number.
   * @param priceChangeFrac - The price change string from the table.
   * @returns The numeric value of the price change.
   */
  static parsePriceChangeFrac(priceChangeFrac: string): number {
    return getNumberFromText(priceChangeFrac);
  }

  /**
   * Returns the content of the market content in the trigger.
   * @returns The content of the market content in the trigger (e.g. "BTC Perp").
   */
  async getTriggerMarketContent(): Promise<string> {
    return (await this.triggerMarketContent.innerText()).trim();
  }

  /**
   * Opens the market switcher popover by clicking the trigger.
   */
  async open(): Promise<void> {
    await this.trigger.click();
  }

  /**
   * Searches for a market by typing into the search input inside the popover.
   * @param query - The market name or symbol to search for.
   */
  async search(query: string): Promise<void> {
    await this.searchBox.fill(query);
  }

  /**
   * Selects a category filter tab in the switcher.
   * @param category - The category to filter by.
   */
  async selectCategory(category: MarketCategory): Promise<void> {
    await this.page
      .getByTestId(`trading-market-switcher-category-filter-${category}`)
      .click();
  }

  /**
   * Returns all visible market row locators in the table.
   * @returns Array of Locator elements for each market row.
   */
  async getRowLocators(): Promise<Locator[]> {
    const rows = this.table.locator(
      '[data-testid^="trading-market-switcher-desktop-table-row-"]',
    );
    const count = await rows.count();
    return Array.from({ length: count }, (_, i) => rows.nth(i));
  }

  /**
   * Returns all visible market rows as MarketSwitcherRow objects.
   * @returns Array of MarketSwitcherRow objects.
   */
  async getRows(): Promise<MarketSwitcherRow[]> {
    const rowLocators = await this.getRowLocators();
    return rowLocators.map((locator) => new MarketSwitcherRow(locator));
  }

  /**
   * Returns the number of visible market rows in the table.
   * @returns The count of market rows.
   */
  async getRowCount(): Promise<number> {
    return this.table
      .locator('[data-testid^="trading-market-switcher-desktop-table-row-"]')
      .count();
  }

  /**
   * Parses all visible market rows into structured data.
   * @returns Array of parsed market row objects.
   */
  async getMarkets(): Promise<MarketSwitcherRowData[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getData()));
  }

  /**
   * Selects a market by clicking its unique market name cell directly.
   * Uses the `trading-market-switcher-market-name-cell-{marketName}` data-testid.
   * @param marketName - The display name of the market (e.g. "FARTCOINUSDT0").
   */
  async selectMarket(marketName: string): Promise<void> {
    await this.page
      .getByTestId(`trading-market-switcher-market-name-cell-${marketName}`)
      .click();
  }

  /**
   * Toggles the favorite status of a market row by its index.
   * @param index - The zero-based index of the row in the visible table.
   */
  async toggleFavorite(index: number): Promise<void> {
    const rows = await this.getRows();
    if (index >= rows.length) {
      throw new Error(
        `Row index ${index} out of bounds (count: ${rows.length})`,
      );
    }
    await rows[index].toggleFavorite();
  }

  /**
   * Opens the switcher, searches for the market, and selects it.
   * Convenience method that chains open, search, and select.
   * @param marketName - The display name of the market to switch to.
   */
  async switchToMarket(marketName: string): Promise<void> {
    await this.open();
    await this.search(marketName);
    await this.selectMarket(marketName);
  }
}
