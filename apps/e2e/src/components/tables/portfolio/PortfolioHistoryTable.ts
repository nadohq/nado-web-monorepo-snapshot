import { Page } from '@playwright/test';
import { BaseTable } from 'src/components/tables/BaseTable';
import { WithdrawalHistoryRow } from 'src/components/tables/portfolio/PortfolioWithdrawalHistoryRow';
import { WithdrawalHistoryItem } from 'src/types/withdrawalTypes';

export class WithdrawalHistoryTable extends BaseTable<
  WithdrawalHistoryRow,
  WithdrawalHistoryItem
> {
  constructor(page: Page) {
    super(page.locator('body'));
  }

  getRow(index: number): WithdrawalHistoryRow {
    return new WithdrawalHistoryRow(this.container, index);
  }

  async getLastWithdrawal(): Promise<WithdrawalHistoryItem> {
    return this.getRow(0).getData();
  }
}
