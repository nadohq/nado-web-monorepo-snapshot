import { Page } from '@playwright/test';
import { BaseConsoleHeader } from 'src/components/trading/BaseConsoleHeader';
import { BaseInputs } from 'src/components/trading/BaseInputs';
import { LimitInputs } from 'src/components/trading/LimitInputs';
import { OrderSettings } from 'src/components/trading/OrderSettings';
import { OrderTypeTabs } from 'src/components/trading/OrderTypeTabs';
import { ScaledInputs } from 'src/components/trading/ScaledInputs';
import { StopLimitInputs } from 'src/components/trading/StopLimitInputs';
import { StopMarketInputs } from 'src/components/trading/StopMarketInputs';
import { TwapInputs } from 'src/components/trading/TwapInputs';

/**
 * Base order form containing shared components for both spot and perp trading.
 * Subclasses implement their own `configure()` logic.
 */
export abstract class BaseOrderForm<
  H extends BaseConsoleHeader = BaseConsoleHeader,
> {
  readonly page: Page;
  readonly header: H;

  readonly orderTypeTabs: OrderTypeTabs;
  readonly baseInputs: BaseInputs;
  readonly limitInputs: LimitInputs;
  readonly scaledInputs: ScaledInputs;
  readonly twapInputs: TwapInputs;
  readonly stopMarketInputs: StopMarketInputs;
  readonly stopLimitInputs: StopLimitInputs;

  readonly orderSettings: OrderSettings;

  constructor(page: Page, header: H) {
    this.page = page;
    this.header = header;

    this.orderSettings = new OrderSettings(page);

    this.orderTypeTabs = new OrderTypeTabs(page);
    this.baseInputs = new BaseInputs(page, header);
    this.limitInputs = new LimitInputs(page, header);
    this.scaledInputs = new ScaledInputs(page, header);
    this.twapInputs = new TwapInputs(page, header);
    this.stopMarketInputs = new StopMarketInputs(page, header);
    this.stopLimitInputs = new StopLimitInputs(page, header);
  }
}
