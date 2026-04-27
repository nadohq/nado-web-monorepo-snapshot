import { Page } from '@playwright/test';
import { ConnectWalletDialog } from 'src/components/dialogs/ConnectWalletDialog';
import { MarketingDialog } from 'src/components/dialogs/MarketingDialog';
import { OnboardingDialog } from 'src/components/dialogs/OnboardingDialog';
import { OneClickTradingDialog } from 'src/components/dialogs/OneClickTradingDialog';
import { AccountDropdown } from 'src/components/layout/AccountDropdown';
import { Navbar } from 'src/components/layout/Navbar';
import { NotificationToaster } from 'src/components/notifications/NotificationToaster';
import { CookieBanner } from 'src/components/onboarding/CookieBanner';
import { TutorialPopover } from 'src/components/onboarding/TutorialPopover';
import { TradingTableTabsOpenOrders } from 'src/components/tables/positions/TradingTableTabsOpenOrders';
import { AccountCard } from 'src/components/trading/AccountCard';
import { OrderPlacementAccountInfo } from 'src/components/trading/OrderPlacementAccountInfo';
import { BasePage } from 'src/pages/BasePage';

/**
 * Base Page Object Model for trading pages (perpetuals & spot).
 * Contains shared layout, dialog, and order components plus common navigation logic.
 */
export abstract class BaseTradePage extends BasePage {
  // Layout components
  readonly navbar: Navbar;
  readonly accountDropdown: AccountDropdown;
  readonly toast: NotificationToaster;

  // Dialog components
  readonly marketingDialog: MarketingDialog;
  readonly oneClickTradingDialog: OneClickTradingDialog;

  // Trading components
  readonly accountInfo: OrderPlacementAccountInfo;
  readonly accountCard: AccountCard;

  // Orders components
  readonly openOrders: TradingTableTabsOpenOrders;

  /** Route path used by `goto()`, e.g. `/perpetuals` or `/spot`. */
  protected abstract readonly routePath: string;

  // Onboarding components
  readonly connectWalletDialog: ConnectWalletDialog;
  readonly onboardingDialog: OnboardingDialog;
  readonly tutorialPopover: TutorialPopover;
  readonly cookieBanner: CookieBanner;

  /** Default market symbol when none is specified in `goto()`. */
  protected abstract readonly defaultMarket: string;

  constructor(page: Page) {
    super(page);

    // Layout
    this.navbar = new Navbar(page);
    this.accountDropdown = new AccountDropdown(page);
    this.toast = new NotificationToaster(page);

    // Dialogs
    this.marketingDialog = new MarketingDialog(page);
    this.oneClickTradingDialog = new OneClickTradingDialog(page);

    // Onboarding
    this.connectWalletDialog = new ConnectWalletDialog(page);
    this.onboardingDialog = new OnboardingDialog(page);
    this.tutorialPopover = new TutorialPopover(page);
    this.cookieBanner = new CookieBanner(page);

    // Trading
    this.accountInfo = new OrderPlacementAccountInfo(page);
    this.accountCard = new AccountCard(page);

    // Orders
    this.openOrders = new TradingTableTabsOpenOrders(page);
  }

  async goto(market?: string): Promise<void> {
    await this.gotoAndWaitForResponses(
      `${this.routePath}?market=${market ?? this.defaultMarket}`,
      ['matches', 'account_snapshots', 'subaccounts'],
    );
  }
}
