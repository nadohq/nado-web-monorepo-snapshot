import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

/**
 * Handles Terms of Use dialog and Welcome (Key Features) dialog.
 * These are shown sequentially during first-time onboarding.
 */
export class OnboardingDialog extends BaseDialog {
  readonly agreeToTermsButton: Locator;
  readonly startTradingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.agreeToTermsButton = this.container.getByTestId(
      'terms-of-use-dialog-agree-to-terms-button',
    );
    this.startTradingButton = this.container.getByTestId(
      'key-features-dialog-start-trading-button',
    );
  }

  async agreeToTerms(): Promise<void> {
    await this.agreeToTermsButton.click();
  }

  async startTrading(): Promise<void> {
    await this.startTradingButton.click();
  }
}
