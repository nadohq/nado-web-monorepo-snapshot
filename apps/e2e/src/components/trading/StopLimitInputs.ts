import { Locator, Page } from '@playwright/test';
import { BaseConsoleHeader } from 'src/components/trading/BaseConsoleHeader';
import { BaseInputs } from 'src/components/trading/BaseInputs';

interface StopLimitOrderFormData {
  triggerPrice: string;
  limitPrice: string;
  size: string;
}

/**
 * Input component for Stop Limit orders.
 * Combines trigger price (activation threshold) with limit price (execution ceiling/floor).
 */
export class StopLimitInputs extends BaseInputs {
  readonly triggerPriceInput: Locator;
  readonly limitPriceInput: Locator;

  constructor(page: Page, header: BaseConsoleHeader) {
    super(page, header);

    this.triggerPriceInput = this.page.getByTestId(
      'order-form-trigger-price-input',
    );
    this.limitPriceInput = this.page.getByTestId(
      'order-form-limit-price-input',
    );
  }

  async fillForm(data: StopLimitOrderFormData) {
    await this.triggerPriceInput.fill(data.triggerPrice);
    await this.limitPriceInput.fill(data.limitPrice);
    await this.sizeInput.fill(data.size);
  }
}
