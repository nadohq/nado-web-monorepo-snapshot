import { Locator } from '@playwright/test';

/**
 * Base class for table rows with common locators and functionality.
 * All selectors are scoped to the provided container to avoid conflicts with other tables.
 */
export abstract class BaseRow<TData = unknown> {
  protected readonly container: Locator;
  protected readonly index: number;

  readonly leftRow: Locator;
  readonly centerRow: Locator;
  readonly rightRow: Locator;

  constructor(container: Locator, index: number) {
    this.container = container;
    this.index = index;

    this.leftRow = this.container
      .locator('[data-testid^="data-table-row-group-left-"]')
      .nth(index);
    /**
     * The center row group is used as the primary locator for the row's existence
     * and as a base for data-table-row-group-center-{id} selectors.
     */
    this.centerRow = this.container
      .locator('[data-testid^="data-table-row-group-center-"]')
      .nth(index);
    this.rightRow = this.container
      .locator('[data-testid^="data-table-row-group-right-"]')
      .nth(index);
  }

  abstract getData(): Promise<TData>;

  async exists(): Promise<boolean> {
    return (await this.centerRow.count()) > 0;
  }
}
