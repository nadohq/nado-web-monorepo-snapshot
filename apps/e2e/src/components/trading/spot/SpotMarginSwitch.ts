import { Locator, Page } from '@playwright/test';

/**
 * Page object for the Spot Margin toggle switch.
 * Controls whether spot margin (leverage) is enabled for spot trading.
 */
export class SpotMarginSwitch {
  readonly toggle: Locator;

  constructor(page: Page) {
    this.toggle = page.getByTestId('spot-margin-switch-toggle');
  }
}
