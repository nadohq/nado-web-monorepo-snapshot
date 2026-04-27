import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';
import { getNumberFromText } from 'src/utils/format';

export class WalletDepositDialog extends BaseDialog {
  readonly amountInput: Locator;
  readonly submitButton: Locator;

  readonly availableButton: Locator;

  constructor(page: Page) {
    super(page);

    this.amountInput = this.container.getByTestId(
      'wallet-deposit-amount-input',
    );
    this.submitButton = this.container.getByTestId(
      'wallet-deposit-submit-button',
    );
    this.availableButton = this.container.getByTestId(
      'wallet-deposit-available-button',
    );
  }

  async fillAmount(amount: string) {
    await this.amountInput.fill(amount);
  }

  async submit() {
    // Click submit for approve step if visible
    if (await this.submitButton.filter({ hasText: /approve/i }).isVisible()) {
      await this.submitButton.click();
    }

    // Now click deposit
    await this.submitButton.click();
  }

  async waitForSuccess(timeout = 5000) {
    await this.submitButton
      .filter({ hasText: /deposited/i })
      .waitFor({ state: 'visible', timeout });
  }

  async selectMaxAmount() {
    await this.availableButton.click();
  }

  async getAvailableAmount() {
    const text = await this.availableButton.textContent();
    return getNumberFromText(text ?? '0');
  }
}
