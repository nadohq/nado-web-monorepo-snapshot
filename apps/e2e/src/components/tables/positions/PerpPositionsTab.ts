import { expect, Locator, Page } from '@playwright/test';
import { CloseAllPositionsDialog } from 'src/components/dialogs/CloseAllPositionsDialog';
import { PerpPositionRow } from 'src/components/tables/positions/PerpPositionRow';
import { Position } from 'src/types/positionTypes';

/**
 * Page object for the Positions trading table tabs.
 * Handles navigation to the positions tab and provides access to position rows.
 */
export class PerpPositionsTab {
  readonly page: Page;

  readonly positionsTab: Locator;
  readonly closeAllButton: Locator;
  readonly closeAllDropdown: Locator;

  constructor(page: Page) {
    this.page = page;

    this.positionsTab = this.page.getByTestId('table-tabs-trigger-positions');
    this.closeAllButton = this.page.getByTestId(
      'close-all-positions-dropdown-button',
    );
    this.closeAllDropdown = this.page.getByTestId(
      'close-all-positions-dropdown-item-all',
    );
  }

  private getContainer(): Locator {
    return this.page.getByTestId('table-tabs-content-positions');
  }

  getPositionRow(index: number): PerpPositionRow {
    return new PerpPositionRow(this.page, this.getContainer(), index);
  }

  /**
   * Returns the number of positions currently displayed in the table.
   * Uses the ^= (starts-with) attribute selector to find all data rows starting with 'data-table-row-group-center-'.
   */
  async getPositionCount(): Promise<number> {
    await this.positionsTab.click();

    return this.getContainer()
      .locator('[data-testid^="data-table-row-group-center-"]')
      .count();
  }

  /**
   * Quick check if any positions exist (faster than getPositionCount for cleanup logic).
   * Navigates to positions tab and checks first row existence.
   */
  async hasAnyPositions(): Promise<boolean> {
    await this.positionsTab.click();
    return this.getPositionRow(0).exists();
  }

  async waitForPositionCount(
    expectedCount: number,
    timeout = 5000,
  ): Promise<void> {
    await expect(async () => {
      const count = await this.getPositionCount();

      expect.soft(count).toBe(expectedCount);
    }).toPass({ timeout });

    await this.page.waitForTimeout(2 * 1000);
  }

  /**
   * Closes all positions if any exist.
   * First checks for position existence to skip unnecessary UI interactions.
   */
  async closeAllPositions(): Promise<void> {
    const hasPositions = await this.hasAnyPositions();
    if (!hasPositions) {
      return;
    }

    await this.closeAllButton.click();
    await this.closeAllDropdown.click();

    const closeAllPositionsDialog = new CloseAllPositionsDialog(this.page);
    await closeAllPositionsDialog.closeAllPositions();
  }

  /**
   * Returns data for all positions currently displayed in the table.
   * Uses the ^= (starts-with) attribute selector to identify and iterate over all rows starting with 'data-table-row-group-center-'.
   */
  async getPositions(): Promise<Position[]> {
    await this.positionsTab.click();

    const rows = await this.getContainer()
      .locator('[data-testid^="data-table-row-group-center-"]')
      .all();

    return Promise.all(
      rows.map((_, index) => this.getPositionRow(index).getData()),
    );
  }

  async findPositionByMarket(
    market: string,
  ): Promise<PerpPositionRow | undefined> {
    const positions = await this.getPositions();
    const index = positions.findIndex((p) => p.market === market);

    return index !== -1 ? this.getPositionRow(index) : undefined;
  }

  async closePositionByMarket(market: string): Promise<void> {
    const row = await this.findPositionByMarket(market);
    if (!row) {
      throw new Error(`Position with market ${market} not found`);
    }
    const closeDialog = await row.clickMarketClose();
    await closeDialog.submit();
    await this.page.waitForTimeout(2 * 1000);
  }
}
