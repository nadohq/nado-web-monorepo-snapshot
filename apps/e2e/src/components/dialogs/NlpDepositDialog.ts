import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

export class NlpDepositDialog extends BaseDialog {
  readonly amountInput: Locator;
  readonly availableValue: Locator;
  readonly maxDepositValue: Locator;
  readonly gasFeeValue: Locator;
  readonly receiveValue: Locator;
  readonly lockUpPeriodValue: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.amountInput = this.container.getByTestId(
      'nlp-deposit-dialog-amount-input',
    );
    this.availableValue = this.container.getByTestId(
      'nlp-deposit-dialog-available-input',
    );
    this.maxDepositValue = this.container.getByTestId(
      'nlp-deposit-dialog-max-deposit-input',
    );
    this.gasFeeValue = this.container.getByTestId(
      'nlp-deposit-dialog-gas-fee-input',
    );
    this.receiveValue = this.container.getByTestId(
      'nlp-deposit-dialog-receive-input',
    );
    this.lockUpPeriodValue = this.container.getByTestId(
      'nlp-deposit-dialog-lock-up-period-input',
    );
    this.submitButton = this.container.getByTestId(
      'nlp-deposit-dialog-submit-button',
    );
  }

  async fillAmount(amount: string) {
    await this.amountInput.fill(amount);
  }

  async submit() {
    await this.submitButton.click();
  }

  async waitForSuccess(timeout = 10000) {
    await this.submitButton.filter({ hasText: 'Liquidity Deposited' }).waitFor({
      state: 'visible',
      timeout,
    });
  }
}
