import { Locator, Page } from '@playwright/test';
import { NlpDepositDialog } from 'src/components/dialogs/NlpDepositDialog';
import { getNumberFromText } from 'src/utils/format';

export class VaultOverview {
  readonly positionValue: Locator;
  readonly balanceValue: Locator;
  readonly cumulativePnlValue: Locator;
  readonly unrealizedPnlValue: Locator;
  readonly depositButton: Locator;
  readonly withdrawButton: Locator;

  constructor(private readonly page: Page) {
    this.positionValue = this.page.getByTestId(
      'nlp-position-card-position-value',
    );
    this.balanceValue = this.page.getByTestId(
      'nlp-position-card-balance-value',
    );
    this.cumulativePnlValue = this.page.getByTestId(
      'nlp-position-card-cumulative-pnl-value',
    );
    this.unrealizedPnlValue = this.page.getByTestId(
      'nlp-position-card-unrealized-pnl-value',
    );
    this.depositButton = this.page.getByTestId(
      'nlp-position-card-deposit-button',
    );
    this.withdrawButton = this.page.getByTestId(
      'nlp-position-card-withdraw-button',
    );
  }

  async deposit(amount: string) {
    await this.depositButton.click();

    const depositDialog = new NlpDepositDialog(this.page);
    await depositDialog.fillAmount(amount);
    await depositDialog.submit();
    await depositDialog.waitForSuccess();
    await depositDialog.close();
  }

  async getVaultData() {
    const [
      positionValue,
      balanceValue,
      cumulativePnlValue,
      unrealizedPnlValue,
    ] = await Promise.all([
      this.positionValue.textContent(),
      this.balanceValue.textContent(),
      this.cumulativePnlValue.textContent(),
      this.unrealizedPnlValue.textContent(),
    ]);

    return {
      positionValue: getNumberFromText(positionValue ?? '0'),
      balanceValue: getNumberFromText(balanceValue ?? '0'),
      cumulativePnlValue: getNumberFromText(cumulativePnlValue ?? '0'),
      unrealizedPnlValue: getNumberFromText(unrealizedPnlValue ?? '0'),
    };
  }
}
