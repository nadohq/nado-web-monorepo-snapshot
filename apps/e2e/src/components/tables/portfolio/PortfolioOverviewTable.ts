import { PortfolioOverviewBalanceRow } from '@/components/tables/portfolio/PortfolioOverviewBalanceRow';
import { Page } from '@playwright/test';
import { BaseTable } from 'src/components/tables/BaseTable';
import { SpotBalance } from 'src/types/spotBalanceTypes';

export class PortfolioOverviewTable extends BaseTable<
  PortfolioOverviewBalanceRow,
  SpotBalance
> {
  constructor(page: Page) {
    super(page.locator('body'));
  }

  getRow(index: number): PortfolioOverviewBalanceRow {
    return new PortfolioOverviewBalanceRow(this.container, index);
  }

  async findBySymbol(symbol: string): Promise<SpotBalance | undefined> {
    const balances = await this.getAllData();

    return balances.find((balance) => balance.symbol === symbol);
  }
}
