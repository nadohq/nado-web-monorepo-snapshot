import { Locator } from '@playwright/test';
import { BaseRow } from 'src/components/tables/BaseRow';

/**
 * Generic base class for data tables.
 * Subclasses implement `getRow()` and inherit
 * row counting and bulk data extraction for free.
 */
export abstract class BaseTable<TRow extends BaseRow<TData>, TData> {
  protected readonly container: Locator;

  constructor(container: Locator) {
    this.container = container;
  }

  protected getRows(): Locator {
    return this.container.locator(
      '[data-testid^="data-table-row-group-center-"]',
    );
  }

  abstract getRow(index: number): TRow;

  async getRowCount(): Promise<number> {
    return this.getRows().count();
  }

  async getAllData(): Promise<TData[]> {
    const rows = await this.getRows().all();

    return Promise.all(rows.map((_, index) => this.getRow(index).getData()));
  }
}
