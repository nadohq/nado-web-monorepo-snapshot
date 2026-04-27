import { Locator } from '@playwright/test';
import { BaseRow } from 'src/components/tables/BaseRow';
import { WithdrawalHistoryItem } from 'src/types/withdrawalTypes';

export class WithdrawalHistoryRow extends BaseRow<WithdrawalHistoryItem> {
  readonly time: Locator;
  readonly asset: Locator;
  readonly amount: Locator;
  readonly value: Locator;
  readonly status: Locator;

  constructor(container: Locator, index: number) {
    super(container, index);

    this.time = this.centerRow.getByTestId('withdrawal-history-table-time');
    this.asset = this.centerRow.getByTestId('withdrawal-history-table-asset');
    this.amount = this.centerRow.getByTestId('withdrawal-history-table-amount');
    this.value = this.centerRow.getByTestId('withdrawal-history-table-value');
    this.status = this.centerRow.getByTestId('withdrawal-history-table-status');
  }

  async getData(): Promise<WithdrawalHistoryItem> {
    const [time, asset, amount, value] = (
      await Promise.all([
        this.time.innerText(),
        this.asset.innerText(),
        this.amount.innerText(),
        this.value.innerText(),
      ])
    ).map((text) => text.trim());

    const isStatusVisible = await this.status.isVisible();
    const status = isStatusVisible
      ? (await this.status.innerText()).trim()
      : undefined;

    return { time, asset, amount, value, status };
  }
}
