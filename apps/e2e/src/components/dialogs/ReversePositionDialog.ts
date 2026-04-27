import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

export interface ReversePositionDetails {
  marketName: string;
  marginMode: string;
  orderType: string;
  size: string;
  midPrice: string;
  slippage: string;
}

/**
 * Page Object Model for the Reverse Position Dialog.
 * This dialog is shown when a user clicks the "Reverse" action on an open position.
 * It allows the user to close the current position and open an opposite one in a single transaction.
 */
export class ReversePositionDialog extends BaseDialog {
  readonly marketNameContainer: Locator;
  readonly marginModeContainer: Locator;
  readonly directionIndicator: Locator;
  readonly longPill: Locator;
  readonly shortPill: Locator;

  readonly orderTypeContainer: Locator;
  readonly sizeContainer: Locator;
  readonly midPriceContainer: Locator;
  readonly slippageContainer: Locator;

  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    // Header info
    this.marketNameContainer = this.container.getByTestId(
      'reverse-position-dialog-market-name',
    );
    this.marginModeContainer = this.container.getByTestId(
      'reverse-position-dialog-margin-mode',
    );
    this.directionIndicator = this.container.getByTestId(
      'reverse-position-dialog-direction-indicator',
    );
    this.longPill = this.container.getByTestId(
      'reverse-position-dialog-long-pill',
    );
    this.shortPill = this.container.getByTestId(
      'reverse-position-dialog-short-pill',
    );

    // Order details
    this.orderTypeContainer = this.container.getByTestId(
      'reverse-position-dialog-order-type',
    );
    this.sizeContainer = this.container.getByTestId(
      'reverse-position-dialog-size',
    );
    this.midPriceContainer = this.container.getByTestId(
      'reverse-position-dialog-mid-price',
    );
    this.slippageContainer = this.container.getByTestId(
      'reverse-position-dialog-slippage',
    );

    this.submitButton = this.container.getByTestId(
      'order-placement-submit-button',
    );
  }

  /**
   * Retrieves all relevant data displayed in the reverse position dialog.
   * This is used to verify that the dialog correctly reflects the position
   * being reversed and the current market conditions/settings.
   */
  async getDialogDetails(): Promise<ReversePositionDetails> {
    const [marketName, marginMode, orderType, size, midPrice, slippage] =
      await Promise.all([
        this.marketNameContainer.innerText(),
        this.marginModeContainer.innerText(),
        this.orderTypeContainer.innerText(),
        this.sizeContainer.innerText(),
        this.midPriceContainer.innerText(),
        this.slippageContainer.locator('button').innerText(),
      ]);

    return {
      marketName: marketName.trim(),
      marginMode: marginMode.trim(),
      orderType: orderType.trim(),
      size: size.trim(),
      midPrice: midPrice.trim(),
      slippage: slippage.trim(),
    };
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
