import { Locator, Page } from '@playwright/test';
import { BaseTpSlDialog } from 'src/components/dialogs/BaseTpSlDialog';

/**
 * Page Object Model for the Add TP/SL Dialog.
 * This dialog is shown when a user clicks the "Add" button in the Manage TP/SL dialog.
 * It provides separate TP and SL price input sections and allows adding new TP/SL orders.
 *
 * Note: The TP and SL sections share the same data-testid attributes, so `.nth()` is used
 * to distinguish them (index 0 = Take Profit, index 1 = Stop Loss).
 */
export class AddTpSlDialog extends BaseTpSlDialog {
  // Take Profit inputs (first section)
  readonly tpTriggerPriceInput: Locator;
  readonly tpGainOrLossInput: Locator;

  // Stop Loss inputs (second section)
  readonly slTriggerPriceInput: Locator;
  readonly slGainOrLossInput: Locator;

  // Options
  readonly partialOrderCheckbox: Locator;
  readonly sizeInput: Locator;

  // Footer
  readonly estimatedPnl: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    // Take Profit inputs (first pair)
    this.tpTriggerPriceInput = this.container
      .getByTestId('tpsl-price-inputs-trigger-price-input')
      .nth(0);
    this.tpGainOrLossInput = this.container
      .getByTestId('tpsl-price-inputs-gain-or-loss-input')
      .nth(0);

    // Stop Loss inputs (second pair)
    this.slTriggerPriceInput = this.container
      .getByTestId('tpsl-price-inputs-trigger-price-input')
      .nth(1);
    this.slGainOrLossInput = this.container
      .getByTestId('tpsl-price-inputs-gain-or-loss-input')
      .nth(1);

    // Options
    this.partialOrderCheckbox = this.container.getByTestId(
      'tpsl-amount-section-partial-order-checkbox',
    );
    this.sizeInput = this.container.getByTestId(
      'tpsl-amount-section-size-input',
    );

    // Footer
    this.estimatedPnl = this.container.getByTestId('tpsl-dialog-estimated-pnl');
    this.submitButton = this.container.getByTestId(
      'add-tpsl-dialog-submit-button',
    );
  }

  /**
   * Fills the Take Profit trigger price input.
   * @param price - The TP trigger price value to enter.
   */
  async fillTpTriggerPrice(price: string): Promise<void> {
    await this.tpTriggerPriceInput.fill(price);
  }

  /**
   * Fills the Take Profit gain/loss value input.
   * @param value - The TP gain percentage/value to enter.
   */
  async fillTpGainOrLoss(value: string): Promise<void> {
    await this.tpGainOrLossInput.fill(value);
  }

  /**
   * Fills the Stop Loss trigger price input.
   * @param price - The SL trigger price value to enter.
   */
  async fillSlTriggerPrice(price: string): Promise<void> {
    await this.slTriggerPriceInput.fill(price);
  }

  /**
   * Fills the Stop Loss gain/loss value input.
   * @param value - The SL loss percentage/value to enter.
   */
  async fillSlGainOrLoss(value: string): Promise<void> {
    await this.slGainOrLossInput.fill(value);
  }

  /**
   * Submits the form by clicking the "Place TP/SL" button.
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
