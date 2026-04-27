import { Locator, Page } from '@playwright/test';
import { ScaledPreviewOrdersDialog } from 'src/components/dialogs/ScaledPreviewOrdersDialog';
import { BaseConsoleHeader } from 'src/components/trading/BaseConsoleHeader';
import { BaseInputs } from 'src/components/trading/BaseInputs';
import { MarginMode } from 'src/types/commonTypes';
import {
  ScaledOrderPriceDistribution,
  ScaledOrderSizeDistribution,
} from 'src/types/scaledOrderTypes';

interface ScaledInputsData {
  startPrice: string;
  endPrice: string;
  size: string;
  quantity: number;
  priceDistribution?: ScaledOrderPriceDistribution;
  sizeDistribution?: ScaledOrderSizeDistribution;
  marginMode?: MarginMode;
  leverage?: string;
}

export class ScaledInputs extends BaseInputs {
  readonly startPriceInput: Locator;
  readonly endPriceInput: Locator;
  readonly quantityInput: Locator;

  readonly priceDistButton: (
    distribution: ScaledOrderPriceDistribution,
  ) => Locator;
  readonly sizeDistButton: (
    distribution: ScaledOrderSizeDistribution,
  ) => Locator;

  readonly previewButton: Locator;

  constructor(page: Page, header: BaseConsoleHeader) {
    super(page, header);

    this.startPriceInput = this.page.getByTestId(
      'scaled-order-form-start-price-input',
    );
    this.endPriceInput = this.page.getByTestId(
      'scaled-order-form-end-price-input',
    );

    this.quantityInput = this.page.getByTestId(
      'scaled-order-form-quantity-input',
    );

    this.priceDistButton = (distribution: ScaledOrderPriceDistribution) =>
      this.page.getByTestId(
        `order-form-scaled-order-price-distribution-${distribution}-button`,
      );

    this.sizeDistButton = (distribution: ScaledOrderSizeDistribution) =>
      this.page.getByTestId(
        `order-form-scaled-order-size-distribution-${distribution}-button`,
      );

    this.previewButton = this.page.getByTestId(
      'scaled-order-form-preview-orders-button',
    );
  }

  async fillForm(data: ScaledInputsData) {
    await this.startPriceInput.fill(data.startPrice);
    await this.endPriceInput.fill(data.endPrice);
    await this.sizeInput.fill(data.size);

    await this.quantityInput.fill(data.quantity.toString());

    if (data.priceDistribution) {
      await this.priceDistButton(data.priceDistribution).click();
    }

    if (data.sizeDistribution) {
      await this.sizeDistButton(data.sizeDistribution).click();
    }
  }

  async clickPreview(): Promise<ScaledPreviewOrdersDialog> {
    await this.previewButton.waitFor({ state: 'visible' });

    await this.previewButton.click();

    return new ScaledPreviewOrdersDialog(this.page);
  }
}
