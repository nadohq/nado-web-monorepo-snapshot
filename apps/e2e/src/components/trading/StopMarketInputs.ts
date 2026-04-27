import { Locator, Page } from '@playwright/test';
import { BaseConsoleHeader } from 'src/components/trading/BaseConsoleHeader';
import { BaseInputs } from 'src/components/trading/BaseInputs';

interface StopMarketOrderFormData {
  triggerPrice: string;
  size: string;
}

export class StopMarketInputs extends BaseInputs {
  readonly triggerPriceInput: Locator;

  constructor(page: Page, header: BaseConsoleHeader) {
    super(page, header);

    this.triggerPriceInput = this.page.getByTestId(
      'order-form-trigger-price-input',
    );
  }

  async fillForm(data: StopMarketOrderFormData) {
    await this.triggerPriceInput.fill(data.triggerPrice);
    await this.sizeInput.fill(data.size);
  }
}
