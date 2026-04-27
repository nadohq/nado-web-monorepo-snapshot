import { Locator } from '@playwright/test';
import { BaseRow } from 'src/components/tables/BaseRow';
import { MarginMode } from 'src/types/commonTypes';
import { OrderDirection, StopOrder } from 'src/types/orderTypes';

/**
 * Represents a single stop order row (Stop Market / Stop Limit).
 * Uses the same table structure as TP/SL (open-price-trigger-orders-table).
 */
export class StopOrderRow extends BaseRow<StopOrder> {
  readonly marketName: Locator;
  readonly marginModeLabel: Locator;
  readonly orderType: Locator;
  readonly direction: Locator;
  readonly orderPrice: Locator;
  readonly amount: Locator;
  readonly orderValue: Locator;
  readonly triggerCondition: Locator;
  readonly reduceOnly: Locator;
  readonly time: Locator;
  readonly cancelButton: Locator;

  constructor(container: Locator, index: number) {
    super(container, index);

    this.marketName = this.leftRow.getByTestId(
      'orders-table-order-market-label-market-name',
    );
    this.marginModeLabel = this.leftRow.getByTestId(
      'orders-table-order-market-label-margin-mode',
    );

    this.orderType = this.centerRow.getByTestId(
      'open-price-trigger-orders-table-order-type',
    );
    this.direction = this.centerRow.getByTestId(
      'open-engine-orders-table-order-direction',
    );
    this.orderPrice = this.centerRow.getByTestId(
      'open-price-trigger-orders-table-order-price',
    );
    this.amount = this.centerRow.getByTestId(
      'open-price-trigger-orders-table-order-amount',
    );
    this.orderValue = this.centerRow.getByTestId(
      'open-price-trigger-orders-table-order-value',
    );
    this.triggerCondition = this.centerRow.getByTestId(
      'open-price-trigger-orders-table-trigger-condition',
    );
    this.reduceOnly = this.centerRow.getByTestId(
      'open-price-trigger-orders-table-reduce-only',
    );
    this.time = this.centerRow.getByTestId(
      'open-price-trigger-orders-table-time',
    );
    this.cancelButton = this.rightRow.getByTestId(
      'open-price-trigger-orders-table-cancel-order',
    );
  }

  async getData(): Promise<StopOrder> {
    const market = (await this.marketName.innerText()).trim();
    const marginModeText = (await this.marginModeLabel.innerText()).trim();
    const marginMode =
      marginModeText === 'Cross' ? MarginMode.Cross : MarginMode.Isolated;

    const orderType = (await this.orderType.innerText()).trim();
    const direction = (await this.direction.innerText()).trim().toLowerCase();

    const orderPrice = (await this.orderPrice.innerText()).trim();
    const amount = (await this.amount.innerText()).trim();
    const orderValue = (await this.orderValue.innerText()).trim();
    const triggerCondition = (await this.triggerCondition.innerText()).trim();
    const reduceOnly = (await this.reduceOnly.innerText()).trim();
    const date = (await this.time.locator('span').first().innerText()).trim();

    return {
      market,
      marginMode,
      orderType,
      direction: direction as OrderDirection,
      orderPrice,
      amount,
      orderValue,
      triggerCondition,
      reduceOnly,
      date,
    };
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
