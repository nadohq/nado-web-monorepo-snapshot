import { Locator } from '@playwright/test';
import { BaseRow } from 'src/components/tables/BaseRow';
import { SpotBalance } from 'src/types/spotBalanceTypes';

export class PortfolioOverviewBalanceRow extends BaseRow<SpotBalance> {
  readonly symbol: Locator;
  readonly amount: Locator;
  readonly value: Locator;
  readonly depositApy: Locator;
  readonly borrowApy: Locator;
  readonly estimatedPnl: Locator;
  readonly netInterest: Locator;

  constructor(container: Locator, index: number) {
    super(container, index);

    this.symbol = this.leftRow.getByTestId('spot-balances-table-product-label');
    this.amount = this.centerRow.getByTestId('spot-balances-table-amount');
    this.value = this.centerRow.getByTestId('spot-balances-table-value');
    this.depositApy = this.centerRow.getByTestId(
      'spot-balances-table-deposit-apy',
    );
    this.borrowApy = this.centerRow.getByTestId(
      'spot-balances-table-borrow-apy',
    );
    this.estimatedPnl = this.centerRow.getByTestId(
      'spot-balances-table-estimated-pnl',
    );
    this.netInterest = this.centerRow.getByTestId(
      'spot-balances-table-net-interest',
    );
  }

  async getData(): Promise<SpotBalance> {
    const [symbol, amount, value, depositApy, borrowApy, netInterest] = (
      await Promise.all([
        this.symbol.innerText(),
        this.amount.innerText(),
        this.value.innerText(),
        this.depositApy.innerText(),
        this.borrowApy.innerText(),
        this.netInterest.innerText(),
      ])
    ).map((text) => text.trim());

    const isEstimatedPnlVisible = await this.estimatedPnl.isVisible();
    const estimatedPnl = isEstimatedPnlVisible
      ? (await this.estimatedPnl.innerText()).trim()
      : undefined;

    return {
      symbol,
      amount,
      value,
      depositApy,
      borrowApy,
      estimatedPnl,
      netInterest,
    };
  }
}
