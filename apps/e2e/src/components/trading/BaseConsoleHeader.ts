import { Page } from '@playwright/test';

/**
 * Abstract base for the console header section of an order form.
 *
 * Owns the shared `page` reference and declares the `selectSide` contract
 * that both `PerpConsoleHeader` and `SpotConsoleHeader` implement with
 * their own side types.
 */
export abstract class BaseConsoleHeader {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  abstract selectSide(side: string): Promise<void>;
}
