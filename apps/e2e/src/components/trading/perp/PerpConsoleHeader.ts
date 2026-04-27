import { BalanceSide } from '@nadohq/client';
import { Locator, Page } from '@playwright/test';
import { MarginModeDialog } from 'src/components/dialogs/MarginModeDialog';
import { BaseConsoleHeader } from 'src/components/trading/BaseConsoleHeader';
import { MarginMode } from 'src/types/commonTypes';

export class PerpConsoleHeader extends BaseConsoleHeader {
  readonly marginModeButton: Locator;
  readonly leverageButton: Locator;
  readonly longSideTab: Locator;
  readonly shortSideTab: Locator;

  constructor(page: Page) {
    super(page);

    this.marginModeButton = page.getByTestId(
      'perp-order-placement-section-margin-mode-button',
    );
    this.leverageButton = page.getByTestId(
      'perp-order-placement-section-leverage-button',
    );
    this.longSideTab = page.getByTestId(
      'order-placement-section-order-side-tab-long',
    );
    this.shortSideTab = page.getByTestId(
      'order-placement-section-order-side-tab-short',
    );
  }

  async selectMarginMode(mode: MarginMode) {
    await this.marginModeButton.click();

    const marginModeDialog = new MarginModeDialog(this.page);
    await marginModeDialog.selectMarginMode(mode);
  }

  async selectSide(side: BalanceSide) {
    if (side === 'long') {
      await this.longSideTab.click();
    } else {
      await this.shortSideTab.click();
    }
  }

  async configure(options: { marginMode?: MarginMode; side?: BalanceSide }) {
    if (options.marginMode) {
      await this.selectMarginMode(options.marginMode);
    }

    if (options.side) {
      await this.selectSide(options.side);
    }
  }
}
