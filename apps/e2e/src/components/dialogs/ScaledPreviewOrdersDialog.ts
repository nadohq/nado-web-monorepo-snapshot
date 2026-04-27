import { Locator, Page } from '@playwright/test';
import { BaseDialog } from 'src/components/dialogs/BaseDialog';
import {
  ScaledOrderPreviewOrder,
  ScaledOrderPreviewSetup,
} from 'src/types/scaledOrderTypes';

export class ScaledPreviewOrdersDialog extends BaseDialog {
  readonly orderQuantityContainer: Locator;
  readonly totalSizeContainer: Locator;
  readonly priceRangeContainer: Locator;
  readonly avgEntryPriceContainer: Locator;

  readonly tableContainer: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);

    this.orderQuantityContainer = this.container.getByTestId(
      'preview-scaled-orders-dialog-order-quantity',
    );
    this.totalSizeContainer = this.container.getByTestId(
      'preview-scaled-orders-dialog-total-size',
    );
    this.priceRangeContainer = this.container.getByTestId(
      'preview-scaled-orders-dialog-price-range',
    );
    this.avgEntryPriceContainer = this.container.getByTestId(
      'preview-scaled-orders-dialog-avg-entry-price',
    );

    this.tableContainer = this.container.getByTestId(
      'preview-scaled-orders-data-table',
    );
    this.rows = this.tableContainer.locator(
      '[data-testid^="preview-scaled-orders-data-table-row-"]',
    );
  }

  async getSetup(): Promise<ScaledOrderPreviewSetup> {
    const [orderQuantity, totalSize, priceRange, avgEntryPrice] =
      await Promise.all([
        this.orderQuantityContainer.innerText(),
        this.totalSizeContainer.innerText(),
        this.priceRangeContainer.innerText(),
        this.avgEntryPriceContainer.innerText(),
      ]);

    return { orderQuantity, totalSize, priceRange, avgEntryPrice };
  }

  async getOrders(): Promise<ScaledOrderPreviewOrder[]> {
    // Wait for the first row to be visible
    await this.rows.first().waitFor({ state: 'visible', timeout: 5000 });

    const rows = await this.rows.all();

    return Promise.all(
      rows.map(async (row) => {
        // Scoped selection within the row using ends-with suffix for cleaner decoupling from index
        const [orderPrice, orderRatio, orderSize] = await Promise.all([
          row.locator('[data-testid$="_price"]').innerText(),
          row.locator('[data-testid$="_ratioFrac"]').innerText(),
          row.locator('[data-testid$="_size"]').innerText(),
        ]);

        return { orderPrice, orderRatio, orderSize };
      }),
    );
  }
}
