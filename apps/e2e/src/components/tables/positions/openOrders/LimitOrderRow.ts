import { Locator } from '@playwright/test';
import { BaseRow } from 'src/components/tables/BaseRow';
import { MarginMode } from 'src/types/commonTypes';
import { LimitOrder, OrderDirection } from 'src/types/orderTypes';

/**
 * Represents a single limit order row.
 * Uses data-testid attributes for reliable element selection.
 */
export class LimitOrderRow extends BaseRow<LimitOrder> {
  readonly marketName: Locator;
  readonly marginModeLabel: Locator;
  readonly orderType: Locator;
  readonly direction: Locator;
  readonly orderPrice: Locator;
  readonly filledTotal: Locator;
  readonly orderValue: Locator;
  readonly reduceOnly: Locator;
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
    this.orderType = this.centerRow.getByTestId(
      'open-engine-orders-table-order-type',
    );
    this.direction = this.centerRow.getByTestId(
      'open-engine-orders-table-order-direction',
    );
    this.orderPrice = this.centerRow.getByTestId(
      'open-engine-orders-table-order-price',
    );
    this.filledTotal = this.centerRow.getByTestId(
      'open-engine-orders-table-filled-total',
    );
    this.orderValue = this.centerRow.getByTestId(
      'open-engine-orders-table-order-value',
    );
    this.reduceOnly = this.centerRow.getByTestId(
      'open-engine-orders-table-reduce-only',
    );
    this.time = this.centerRow.getByTestId('open-engine-orders-table-time');

    // Right row - actions
    this.cancelButton = this.rightRow.getByTestId(
      'open-engine-orders-table-cancel-order',
    );
  }

  async getData(): Promise<LimitOrder> {
    const market = (await this.marketName.innerText()).trim();
    const marginModeText = (await this.marginModeLabel.innerText()).trim();
    const marginMode =
      marginModeText === 'Cross' ? MarginMode.Cross : MarginMode.Isolated;

    const orderType = (await this.orderType.innerText()).trim();
    const direction = (await this.direction.innerText()).trim().toLowerCase();
    const orderPrice = (await this.orderPrice.innerText()).trim();
    const filledTotal = (await this.filledTotal.innerText()).trim();
    const orderValue = (await this.orderValue.innerText()).trim();
    const reduceOnly = (await this.reduceOnly.innerText()).trim();
    const date = (await this.time.locator('span').first().innerText()).trim();

    return {
      market,
      marginMode,
      orderType,
      direction: direction as OrderDirection,
      orderPrice,
      filledTotal,
      orderValue,
      reduceOnly,
      date,
    };
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
