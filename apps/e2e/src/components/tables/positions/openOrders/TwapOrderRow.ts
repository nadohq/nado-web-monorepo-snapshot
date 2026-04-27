import { BalanceSide } from '@nadohq/client';
import { Locator } from '@playwright/test';
import { BaseRow } from 'src/components/tables/BaseRow';
import { MarginMode } from 'src/types/commonTypes';
import { TwapOrder } from 'src/types/orderTypes';

/**
 * Represents a single TWAP order row.
 * Uses data-testid attributes for reliable element selection.
 */
export class TwapOrderRow extends BaseRow<TwapOrder> {
  readonly marketName: Locator;
  readonly marginModeLabel: Locator;
  readonly direction: Locator;
  readonly orderPrice: Locator;
  readonly filledTotal: Locator;
  readonly reduceOnly: Locator;
  readonly status: Locator;
  readonly frequency: Locator;
  readonly runtime: Locator;
  readonly time: Locator;
  readonly cancelButton: Locator;

  constructor(container: Locator, index: number) {
    super(container, index);

    // Left row - market info
    this.marketName = this.leftRow.getByTestId(
      'orders-table-order-market-label-market-name',
    );
    this.marginModeLabel = this.leftRow.getByTestId(
      'orders-table-order-market-label-margin-mode',
    );

    // Center row - order data
    this.direction = this.centerRow.getByTestId(
      'open-time-trigger-orders-table-order-direction',
    );
    this.orderPrice = this.centerRow.getByTestId(
      'open-time-trigger-orders-table-order-price',
    );
    this.filledTotal = this.centerRow.getByTestId(
      'open-time-trigger-orders-table-order-amount',
    );
    this.reduceOnly = this.centerRow.getByTestId(
      'open-time-trigger-orders-table-reduce-only',
    );
    this.status = this.centerRow.getByTestId(
      'open-time-trigger-orders-table-status',
    );
    this.frequency = this.centerRow.getByTestId(
      'open-time-trigger-orders-table-frequency',
    );
    this.runtime = this.centerRow.getByTestId(
      'open-time-trigger-orders-table-runtime',
    );
    this.time = this.centerRow.getByTestId(
      'open-time-trigger-orders-table-time',
    );

    // Right row - actions
    this.cancelButton = this.rightRow.getByTestId(
      'open-time-trigger-orders-table-cancel-order',
    );
  }

  async getData(): Promise<TwapOrder> {
    const market = (await this.marketName.innerText()).trim();
    const marginModeText = (await this.marginModeLabel.innerText()).trim();
    const marginMode =
      marginModeText === 'Cross' ? MarginMode.Cross : MarginMode.Isolated;

    const directionText = (await this.direction.innerText()).trim();
    const direction: BalanceSide = directionText === 'Long' ? 'long' : 'short';
    const orderPrice = (await this.orderPrice.innerText()).trim();
    const filledTotal = (await this.filledTotal.innerText()).trim();
    const reduceOnly = (await this.reduceOnly.innerText()).trim();
    const date = (await this.time.locator('span').first().innerText()).trim();

    return {
      market,
      marginMode,
      orderType: 'TWAP', // Hardcoded as it's not explicitly in a cell but it's the TWAP tab
      direction,
      orderPrice,
      filledTotal,
      orderValue: '', // Not in the table
      reduceOnly,
      date,
    };
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
