import { Locator, Page } from '@playwright/test';
import { BaseConsoleHeader } from 'src/components/trading/BaseConsoleHeader';
import { BaseInputs } from 'src/components/trading/BaseInputs';

export class TwapInputs extends BaseInputs {
  readonly hoursInput: Locator;
  readonly minutesInput: Locator;
  readonly frequencySelect: Locator;

  constructor(page: Page, header: BaseConsoleHeader) {
    super(page, header);

    this.hoursInput = page.getByTestId('twap-order-duration-hours-input');
    this.minutesInput = page.getByTestId('twap-order-duration-minutes-input');
    this.frequencySelect = page.getByTestId('twap-order-form-frequency-select');
  }

  async fillForm(data: {
    size: string;
    hours?: string;
    minutes?: string;
    frequency?: string;
  }) {
    await this.sizeInput.fill(data.size);

    if (data.hours !== undefined) {
      await this.hoursInput.fill(data.hours);
    }
    if (data.minutes !== undefined) {
      await this.minutesInput.fill(data.minutes);
    }
    if (data.frequency !== undefined) {
      await this.frequencySelect.click();
      await this.page
        .getByTestId(
          `twap-order-form-frequency-select-option-${data.frequency}`,
        )
        .click();
    }
  }
}
