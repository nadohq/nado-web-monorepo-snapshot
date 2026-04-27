import { Page } from '@playwright/test';

import { PerpMarketInfoCard } from 'src/components/PerpMarketInfoCard';
import { PerpPositionsTab } from 'src/components/tables/positions/PerpPositionsTab';
import { MarketSwitcher } from 'src/components/trading/MarketSwitcher';
import { PerpOrderForm } from 'src/components/trading/perp/PerpOrderForm';
import { BaseTradePage } from 'src/pages/BaseTradePage';

/**
 * Page Object Model for the main Perpetuals Trade page.
 * Provides access to all UI components via composition.
 */
export class PerpPage extends BaseTradePage {
  // Layout components (perp-specific)
  readonly marketInfoCard: PerpMarketInfoCard;
  // Trading components (perp-specific)
  readonly orderForm: PerpOrderForm;
  readonly marketSwitcher: MarketSwitcher;
  // Positions components
  readonly positions: PerpPositionsTab;
  protected readonly routePath = '/perpetuals';
  protected readonly defaultMarket = 'BTC';

  constructor(page: Page) {
    super(page);

    this.marketInfoCard = new PerpMarketInfoCard(page);

    // Trading
    this.orderForm = new PerpOrderForm(page);
    this.marketSwitcher = new MarketSwitcher(page);

    // Positions
    this.positions = new PerpPositionsTab(page);
  }
}
