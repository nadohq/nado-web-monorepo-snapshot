import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';

export function isValidLeverage(leverage: string): boolean {
  const normalized = leverage.replace(',', '.');
  const value = Number(normalized);

  if (!Number.isFinite(value) || value < 1) return false;

  // Only allow values that are 1 or increase by 0.5 (e.g., 1, 1.5, 2, 2.5, etc.)
  return value % 0.5 === 0;
}

export class LeverageDialog extends BaseDialog {
  readonly leverageInput: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page);

    this.leverageInput = this.container.getByTestId(
      'perp-leverage-dialog-leverage-amount-input',
    );
    this.confirmButton = this.container.getByTestId(
      'perp-leverage-dialog-confirm-button',
    );
  }

  async fillLeverage(leverage: string) {
    if (!isValidLeverage(leverage)) {
      throw new Error(
        `Invalid leverage value: "${leverage}". Expected format: "1", "1.5", "1,5", etc.`,
      );
    }

    await this.leverageInput.fill(leverage);
  }
}
