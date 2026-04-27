import { Locator, Page } from '@playwright/test';
import { AddTpSlDialog } from 'src/components/dialogs/AddTpSlDialog';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';
import { ModifyTpSlDialog } from 'src/components/dialogs/ModifyTpSlDialog';

/** Data extracted from a single TP/SL order row in the Manage dialog. */
export interface ManageTpSlOrderRow {
  orderType: string;
  triggerPrice: string;
  orderPrice: string;
  quantity: string;
  estPnl: string;
}

/**
 * Page Object Model for the Manage TP/SL Dialog.
 * This dialog is shown when a user clicks the TP/SL manage action on an open position.
 * It displays existing TP/SL orders and allows adding, modifying, or cancelling them.
 */
export class ManageTpSlDialog extends BaseDialog {
  readonly cancelAllButton: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page);

    this.cancelAllButton = this.container.getByTestId(
      'manage-tp-sl-dialog-cancel-all-button',
    );
    this.addButton = this.container.getByTestId(
      'manage-tp-sl-dialog-add-button',
    );
  }

  /**
   * Returns the locator for a specific order row by index.
   * @param index - The zero-based index of the order row.
   */
  private getRowLocator(index: number): Locator {
    return this.container
      .getByTestId('manage-tp-sl-dialog-orders-table-row')
      .nth(index);
  }

  /**
   * Returns the number of TP/SL order rows displayed in the dialog.
   * @returns Promise resolving to the order row count.
   */
  async getOrderCount(): Promise<number> {
    return this.container
      .getByTestId('manage-tp-sl-dialog-orders-table-row')
      .count();
  }

  /**
   * Extracts data from a single order row by index.
   * @param index - The zero-based index of the order row.
   * @returns Promise resolving to the order row data.
   */
  async getOrderRowData(index: number): Promise<ManageTpSlOrderRow> {
    const row = this.getRowLocator(index);

    const [orderType, triggerPrice, orderPrice, quantity, estPnl] =
      await Promise.all([
        row
          .getByTestId('manage-tp-sl-dialog-orders-table-order-type')
          .innerText(),
        row
          .getByTestId('manage-tp-sl-dialog-orders-table-trigger-price')
          .innerText(),
        row
          .getByTestId('manage-tp-sl-dialog-orders-table-order-price')
          .innerText(),
        row
          .getByTestId('manage-tp-sl-dialog-orders-table-quantity')
          .innerText(),
        row
          .getByTestId('manage-tp-sl-dialog-orders-table-estimated-pnl')
          .innerText(),
      ]);

    return {
      orderType: orderType.trim(),
      triggerPrice: triggerPrice.trim(),
      orderPrice: orderPrice.trim(),
      quantity: quantity.trim(),
      estPnl: estPnl.trim(),
    };
  }

  /**
   * Returns data for all TP/SL order rows displayed in the dialog.
   * @returns Promise resolving to an array of all order row data.
   */
  async getOrders(): Promise<ManageTpSlOrderRow[]> {
    const count = await this.getOrderCount();

    return Promise.all(
      Array.from({ length: count }, (_, index) => this.getOrderRowData(index)),
    );
  }

  /**
   * Clicks the modify (edit) button on a specific order row
   * and returns the Modify TP/SL dialog.
   * @param index - The zero-based index of the order row to modify.
   * @returns Promise resolving to the ModifyTpSlDialog instance.
   */
  async modifyOrder(index: number): Promise<ModifyTpSlDialog> {
    await this.getRowLocator(index)
      .getByTestId('manage-tp-sl-dialog-orders-table-modify-button')
      .click();

    return new ModifyTpSlDialog(this.page);
  }

  /**
   * Clicks the cancel (delete) button on a specific order row.
   * @param index - The zero-based index of the order row to cancel.
   */
  async cancelOrder(index: number): Promise<void> {
    await this.getRowLocator(index)
      .getByTestId('manage-tp-sl-dialog-orders-table-cancel-button')
      .click();
  }

  /**
   * Cancels all TP/SL orders via the "Cancel All" button.
   */
  async cancelAll(): Promise<void> {
    await this.cancelAllButton.click();
  }

  /**
   * Clicks the "Add" button and returns the Add TP/SL dialog.
   * @returns Promise resolving to the AddTpSlDialog instance.
   */
  async add(): Promise<AddTpSlDialog> {
    await this.addButton.click();

    return new AddTpSlDialog(this.page);
  }
}
