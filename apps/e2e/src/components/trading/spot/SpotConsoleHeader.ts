import { Locator, Page } from '@playwright/test';
import { BaseConsoleHeader } from 'src/components/trading/BaseConsoleHeader';
import { SpotDirection } from 'src/types/orderTypes';

export class SpotConsoleHeader extends BaseConsoleHeader {
  readonly buySideTab: Locator;
  readonly sellSideTab: Locator;

  constructor(page: Page) {
    super(page);

    this.buySideTab = page.getByTestId(
      'order-placement-section-order-side-tab-long',
    );
    this.sellSideTab = page.getByTestId(
      'order-placement-section-order-side-tab-short',
    );
  }

  async selectSide(side: SpotDirection): Promise<void> {
    if (side === 'buy') {
      await this.buySideTab.click();
    } else {
      await this.sellSideTab.click();
    }
  }
}
