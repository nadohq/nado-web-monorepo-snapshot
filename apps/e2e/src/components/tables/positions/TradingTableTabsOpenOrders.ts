import { expect, Locator, Page } from '@playwright/test';
import { LimitOrderRow } from 'src/components/tables/positions/openOrders/LimitOrderRow';
import { StopOrderRow } from 'src/components/tables/positions/openOrders/StopOrderRow';
import { TpSlOrderRow } from 'src/components/tables/positions/openOrders/TpSlOrderRow';
import { TwapOrderRow } from 'src/components/tables/positions/openOrders/TwapOrderRow';
import {
  LimitOrder,
  OpenOrdersType,
  StopOrder,
  TpSlOrder,
  TwapOrder,
} from 'src/types/orderTypes';

/**
 * Page object for the Open Orders trading table tabs.
 * Handles navigation between order tabs and provides access to order rows.
 */
export class TradingTableTabsOpenOrders {
  readonly page: Page;

  readonly openOrdersTab: Locator;
  readonly cancelAllButton: Locator;
  readonly cancelAllDropdown: Locator;

  constructor(page: Page) {
    this.page = page;

    this.openOrdersTab = page.getByTestId('table-tabs-trigger-open_orders');
    this.cancelAllButton = page.getByTestId(
      'cancel-all-orders-dropdown-button',
    );
    this.cancelAllDropdown = page.getByTestId(
      'cancel-all-orders-dropdown-item-all',
    );
  }

  /**
   * Returns the tab trigger for the given order kind.
   */
  private getOrderType(type: OpenOrdersType): Locator {
    return this.page.getByTestId(`table-sub-tab-trigger-${type}`);
  }

  /**
   * Returns the container locator for the given order kind's tab content.
   * All row selectors should be scoped to this container to avoid conflicts with other tables.
   */
  private getContainer(type: OpenOrdersType): Locator {
    return this.page.getByTestId(`table-sub-tab-content-${type}`);
  }

  /**
   * Navigates to the Open Orders tab and then to the specific order kind sub-tab.
   */
  private async navigateToOrdersTab(type: OpenOrdersType): Promise<void> {
    await this.openOrdersTab.click();
    await this.getOrderType(type).click();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Limit Orders
  // ─────────────────────────────────────────────────────────────────────────────

  getLimitOrderRow(index: number): LimitOrderRow {
    return new LimitOrderRow(
      this.getContainer(OpenOrdersType.LimitOrders),
      index,
    );
  }

  /**
   * Returns data for all limit orders in the current sub-tab.
   * Uses the ^= (starts-with) attribute selector to find all data rows starting with 'data-table-row-group-center-'.
   */
  async getLimitOrders(): Promise<LimitOrder[]> {
    await this.navigateToOrdersTab(OpenOrdersType.LimitOrders);

    const container = this.getContainer(OpenOrdersType.LimitOrders);
    const rows = await container
      .locator('[data-testid^="data-table-row-group-center-"]')
      .all();

    return Promise.all(
      rows.map((_, index) => this.getLimitOrderRow(index).getData()),
    );
  }

  async hasAnyLimitOrders(): Promise<boolean> {
    return this.getLimitOrderRow(0).exists();
  }

  async waitForLimitOrderCount(
    expectedCount: number,
    timeout = 5000,
  ): Promise<void> {
    await expect(async () => {
      const orders = await this.getLimitOrders();
      expect(orders).toHaveLength(expectedCount);
    }).toPass({ timeout });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Stop Orders
  // ─────────────────────────────────────────────────────────────────────────────

  getStopOrderRow(index: number): StopOrderRow {
    return new StopOrderRow(
      this.getContainer(OpenOrdersType.StopOrders),
      index,
    );
  }

  async getStopOrders(): Promise<StopOrder[]> {
    await this.navigateToOrdersTab(OpenOrdersType.StopOrders);

    const container = this.getContainer(OpenOrdersType.StopOrders);
    const rows = await container
      .locator('[data-testid^="data-table-row-group-center-"]')
      .all();

    return Promise.all(
      rows.map((_, index) => this.getStopOrderRow(index).getData()),
    );
  }

  async hasAnyStopOrders(): Promise<boolean> {
    return this.getStopOrderRow(0).exists();
  }

  async waitForStopOrderCount(
    expectedCount: number,
    timeout = 5000,
  ): Promise<void> {
    await expect(async () => {
      const orders = await this.getStopOrders();
      expect(orders).toHaveLength(expectedCount);
    }).toPass({ timeout });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TP/SL Orders
  // ─────────────────────────────────────────────────────────────────────────────

  getTpSlOrderRow(index: number): TpSlOrderRow {
    return new TpSlOrderRow(this.getContainer(OpenOrdersType.TpSl), index);
  }

  /**
   * Returns data for all TP/SL orders in the current sub-tab.
   * Uses the ^= (starts-with) attribute selector to find all data rows starting with 'data-table-row-group-center-'.
   */
  async getTpSlOrders(): Promise<TpSlOrder[]> {
    await this.navigateToOrdersTab(OpenOrdersType.TpSl);

    const container = this.getContainer(OpenOrdersType.TpSl);
    const rows = await container
      .locator('[data-testid^="data-table-row-group-center-"]')
      .all();

    return Promise.all(
      rows.map((_, index) => this.getTpSlOrderRow(index).getData()),
    );
  }

  async hasAnyTpSlOrders(): Promise<boolean> {
    return this.getTpSlOrderRow(0).exists();
  }

  async waitForTpSlOrderCount(
    expectedCount: number,
    timeout = 5000,
  ): Promise<void> {
    await this.navigateToOrdersTab(OpenOrdersType.TpSl);

    await expect(async () => {
      const orders = await this.getTpSlOrders();
      expect(orders).toHaveLength(expectedCount);
    }).toPass({ timeout });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TWAP Orders
  // ─────────────────────────────────────────────────────────────────────────────

  getTwapOrderRow(index: number): TwapOrderRow {
    return new TwapOrderRow(this.getContainer(OpenOrdersType.Twap), index);
  }

  /**
   * Returns data for all TWAP orders in the current sub-tab.
   */
  async getTwapOrders(): Promise<TwapOrder[]> {
    await this.navigateToOrdersTab(OpenOrdersType.Twap);

    const container = this.getContainer(OpenOrdersType.Twap);
    const rows = await container
      .locator('[data-testid^="data-table-row-group-center-"]')
      .all();

    return Promise.all(
      rows.map((_, index) => this.getTwapOrderRow(index).getData()),
    );
  }

  async hasAnyTwapOrders(): Promise<boolean> {
    return this.getTwapOrderRow(0).exists();
  }

  async waitForTwapOrderCount(
    expectedCount: number,
    timeout = 5000,
  ): Promise<void> {
    await expect(async () => {
      const orders = await this.getTwapOrders();
      expect(orders).toHaveLength(expectedCount);
    }).toPass({ timeout });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Cancel All
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Cancels all open orders of given kind if any exist.
   * First checks for order existence to skip unnecessary UI interactions.
   */
  async cancelAllOpenOrders(type: OpenOrdersType): Promise<void> {
    await this.navigateToOrdersTab(type);

    let hasOrders = false;
    switch (type) {
      case OpenOrdersType.StopOrders:
        hasOrders = await this.hasAnyStopOrders();
        break;
      case OpenOrdersType.TpSl:
        hasOrders = await this.hasAnyTpSlOrders();
        break;
      case OpenOrdersType.Twap:
        hasOrders = await this.hasAnyTwapOrders();
        break;
      default:
        hasOrders = await this.hasAnyLimitOrders();
    }

    if (!hasOrders) {
      return;
    }

    if (!(await this.cancelAllButton.isDisabled())) {
      await this.cancelAllButton.click();
    }

    if (!(await this.cancelAllDropdown.isDisabled())) {
      await this.cancelAllDropdown.click();
    }
  }
}
