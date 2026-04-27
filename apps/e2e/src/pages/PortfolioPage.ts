import { Page } from '@playwright/test';
import { CollateralButtons } from 'src/components/portfolio/CollateralButtons';
import { WithdrawalHistoryTable } from 'src/components/tables/portfolio/PortfolioHistoryTable';
import { PortfolioOverviewTable } from 'src/components/tables/portfolio/PortfolioOverviewTable';
import { BasePage } from 'src/pages/BasePage';

export class PortfolioPage extends BasePage {
  readonly collateralButtons: CollateralButtons;
  readonly overviewTable: PortfolioOverviewTable;
  readonly withdrawalHistoryTable: WithdrawalHistoryTable;

  constructor(page: Page) {
    super(page);

    // Overview
    this.collateralButtons = new CollateralButtons(this.page);
    this.overviewTable = new PortfolioOverviewTable(this.page);

    // History
    this.withdrawalHistoryTable = new WithdrawalHistoryTable(this.page);
  }

  async goto() {
    await this.gotoAndWaitForResponses('/portfolio/overview', [
      'matches',
      'account_snapshots',
      'subaccounts',
    ]);
  }
}
