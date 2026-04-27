import { Locator, Page } from '@playwright/test';
import { BaseConsoleHeader } from 'src/components/trading/BaseConsoleHeader';
import { BaseInputs } from 'src/components/trading/BaseInputs';

interface LimitOrderFormData {
  price: string;
  size: string;
}

export class LimitInputs extends BaseInputs {
  readonly priceInput: Locator;

  constructor(page: Page, header: BaseConsoleHeader) {
    super(page, header);

    this.priceInput = this.page.getByTestId('order-form-limit-price-input');
  }

  async fillForm(data: LimitOrderFormData) {
    await this.priceInput.fill(data.price);
    await this.sizeInput.fill(data.size);
  }
}
