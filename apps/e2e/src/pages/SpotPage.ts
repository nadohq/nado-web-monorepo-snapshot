import { Page } from '@playwright/test';

import { SpotMarketInfoCard } from 'src/components/SpotMarketInfoCard';
import { SpotMarginSwitch } from 'src/components/trading/spot/SpotMarginSwitch';
import { SpotOrderForm } from 'src/components/trading/spot/SpotOrderForm';
import { BaseTradePage } from 'src/pages/BaseTradePage';

/**
 * Page Object Model for the Spot Trading page.
 *
 * Key differences from PerpPage (perpetuals):
 * - Navigates to `/spot?market=...` instead of `/perpetuals?market=...`
 * - Uses SpotOrderForm (no margin mode or leverage by default)
 * - Includes SpotMarginSwitch for enabling spot margin/leverage
 * - No positions table (spot uses a Balances tab instead)
 * - Shares TradingTableTabsOpenOrders with perpetuals
 */
export class SpotPage extends BaseTradePage {
  protected readonly routePath = '/spot';
  protected readonly defaultMarket = 'kBTC/USDT0';

  // Layout components (spot-specific)
  readonly marketInfoCard: SpotMarketInfoCard;

  // Trading components (spot-specific)
  readonly spotMarginSwitch: SpotMarginSwitch;
  readonly orderForm: SpotOrderForm;

  constructor(page: Page) {
    super(page);

    this.marketInfoCard = new SpotMarketInfoCard(page);

    // Trading
    this.spotMarginSwitch = new SpotMarginSwitch(page);
    this.orderForm = new SpotOrderForm(page);
  }
}
