import { Page } from '@playwright/test';
import { BaseOrderForm } from 'src/components/trading/BaseOrderForm';
import { SpotConsoleHeader } from 'src/components/trading/spot/SpotConsoleHeader';
import { SpotDirection } from 'src/types/orderTypes';

/**
 * Order form for spot trading.
 *
 * Key differences from the perp `PerpOrderForm`:
 * - No margin mode or leverage configuration
 * - Uses the spot-specific submit button testId
 * - `configure()` only handles the order side (buy/sell)
 */
export class SpotOrderForm extends BaseOrderForm<SpotConsoleHeader> {
  constructor(page: Page) {
    const header = new SpotConsoleHeader(page);
    super(page, header);
  }

  /**
   * Configures the spot order form.
   * Only handles side selection (no margin mode or leverage for basic spot).
   */
  async configure(data: { side: SpotDirection }) {
    await this.header.selectSide(data.side);
  }
}
