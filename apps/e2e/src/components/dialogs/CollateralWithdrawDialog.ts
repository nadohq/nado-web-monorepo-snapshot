import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

export class CollateralWithdrawDialog extends BaseDialog {
  readonly amountInput: Locator;
  readonly submitButton: Locator;

  readonly trackStatusButton: Locator;

  constructor(page: Page) {
    super(page);

    this.amountInput = this.container.getByTestId('withdraw-amount-input');
    this.submitButton = this.container.getByTestId('withdraw-submit-button');
    this.trackStatusButton = this.container.getByTestId(
      'withdraw-track-status-button',
    );
  }

  async fillAmount(amount: string) {
    await this.amountInput.fill(amount);
  }

  async submit() {
    await this.submitButton.click();
  }

  async waitForSuccess(timeout = 5000) {
    await this.submitButton
      .filter({ hasText: 'Withdrawal Successful' })
      .waitFor({ state: 'visible', timeout });
  }

  async clickTrackStatusButton() {
    await this.trackStatusButton.click();
  }
}
