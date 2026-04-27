import { Locator, Page } from '@playwright/test';
import { BaseTpSlDialog } from 'src/components/dialogs/BaseTpSlDialog';

/**
 * Page Object Model for the Modify TP/SL Dialog.
 * This dialog is shown when a user clicks the modify (edit) button on an existing
 * TP or SL order in the Manage TP/SL dialog. It allows editing trigger price,
 * gain/loss value, and toggling partial/limit order options.
 */
export class ModifyTpSlDialog extends BaseTpSlDialog {
  readonly triggerPriceInput: Locator;
  readonly gainOrLossInput: Locator;
  readonly partialOrderCheckbox: Locator;
  readonly estimatedPnl: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.triggerPriceInput = this.container.getByTestId(
      'tpsl-price-inputs-trigger-price-input',
    );
    this.gainOrLossInput = this.container.getByTestId(
      'tpsl-price-inputs-gain-or-loss-input',
    );
    this.partialOrderCheckbox = this.container.getByTestId(
      'tpsl-amount-section-partial-order-checkbox',
    );
    this.estimatedPnl = this.container.getByTestId('tpsl-dialog-estimated-pnl');
    this.submitButton = this.container.getByTestId(
      'modify-tpsl-dialog-submit-button',
    );
  }

  /**
   * Fills the trigger price input.
   * @param price - The trigger price value to enter.
   */
  async fillTriggerPrice(price: string): Promise<void> {
    await this.triggerPriceInput.fill(price);
  }

  /**
   * Fills the gain/loss value input.
   * @param value - The gain or loss percentage/value to enter.
   */
  async fillGainOrLoss(value: string): Promise<void> {
    await this.gainOrLossInput.fill(value);
  }

  /**
   * Toggles the partial order checkbox.
   * @param enabled - Whether the partial order option should be enabled.
   */
  async setPartialOrder(enabled: boolean): Promise<void> {
    await this.partialOrderCheckbox.setChecked(enabled);
  }

  /**
   * Returns the estimated PnL text displayed in the dialog.
   * @returns Promise resolving to the trimmed estimated PnL string.
   */
  async getEstimatedPnl(): Promise<string> {
    return (await this.estimatedPnl.innerText()).trim();
  }

  /**
   * Submits the modification by clicking the Confirm button.
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
