import { Locator, Page } from '@playwright/test';
import { PlaceOrderType } from 'src/types/placeOrderTypes';

export class OrderTypeTabs {
  private readonly basicOrderTypeButton: (type: string) => Locator;
  private readonly advancedOrderTypeTrigger: Locator;
  private readonly advancedOrderTypeOption: (type: string) => Locator;

  constructor(private readonly page: Page) {
    this.basicOrderTypeButton = (type: string) =>
      this.page.getByTestId(`order-type-basic-option-${type}-button`);
    this.advancedOrderTypeTrigger = this.page.getByTestId(
      'order-type-advanced-option-market-button',
    );
    this.advancedOrderTypeOption = (type: string) =>
      this.page.getByTestId(`order-type-advanced-option-${type}-select-option`);
  }

  async select(type: PlaceOrderType): Promise<void> {
    if (type === 'market' || type === 'limit') {
      await this.basicOrderTypeButton(type).click();
      return;
    }

    // Advanced types
    await this.advancedOrderTypeTrigger.click();
    await this.advancedOrderTypeOption(type).click();
  }
}
