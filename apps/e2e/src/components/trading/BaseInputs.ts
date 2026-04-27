import { Locator, Page } from '@playwright/test';
import { BaseConsoleHeader } from 'src/components/trading/BaseConsoleHeader';
import { TpSlInputs } from 'src/components/trading/TpSlInputs';
import { getNumberFromText } from 'src/utils/format';

export class BaseInputs {
  readonly page: Page;
  readonly header: BaseConsoleHeader;
  readonly tpsl: TpSlInputs;

  readonly sizeInput: Locator;
  readonly sizeDecrementButton: Locator;
  readonly maxSizeLabel: Locator;

  constructor(page: Page, header: BaseConsoleHeader) {
    this.page = page;
    this.header = header;
    this.tpsl = new TpSlInputs(this.page);

    this.sizeInput = this.page.getByTestId('order-form-size-input');
    this.sizeDecrementButton = this.page.getByTestId(
      'order-form-size-denom-button',
    );

    this.maxSizeLabel = this.page.getByTestId('order-form-slider-max-size');
  }

  async getMaxSize(): Promise<number> {
    const text = (await this.maxSizeLabel.innerText()).trim();

    return getNumberFromText(text);
  }
}
