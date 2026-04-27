import { BalanceSide } from '@nadohq/client';
import { Locator } from '@playwright/test';
import { BaseRow } from 'src/components/tables/BaseRow';
import { MarginMode } from 'src/types/commonTypes';
import { TpSlOrder } from 'src/types/orderTypes';

/**
 * Represents a single TP/SL order row.
 * Uses data-testid attributes for reliable element selection.
 */
export class TpSlOrderRow extends BaseRow<TpSlOrder> {
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

    // Left row - market info
    this.marketName = this.leftRow.getByTestId(
      'orders-table-order-market-label-market-name',
    );
    this.marginModeLabel = this.leftRow.getByTestId(
      'orders-table-order-market-label-margin-mode',
    );

    // Center row - order data
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

    // Right row - actions
    this.cancelButton = this.rightRow.getByTestId(
      'open-price-trigger-orders-table-cancel-order',
    );
  }

  async getData(): Promise<TpSlOrder> {
    const market = (await this.marketName.innerText()).trim();
    const marginModeText = (await this.marginModeLabel.innerText()).trim();
    const marginMode =
      marginModeText === 'Cross' ? MarginMode.Cross : MarginMode.Isolated;

    const orderType = (await this.orderType.innerText()).trim();
    const directionText = (await this.direction.innerText()).trim();
    // Direction text can be "Close Long" or "Close Short"
    const direction: BalanceSide = directionText.includes('Long')
      ? 'long'
      : 'short';

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
      direction,
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
