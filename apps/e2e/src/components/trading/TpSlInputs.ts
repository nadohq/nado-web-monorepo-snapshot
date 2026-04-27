import { Locator, Page } from '@playwright/test';
import { StopLossInput, TakeProfitInput, TpSlInput } from 'src/types/tpslTypes';
import { getNumberFromText } from 'src/utils/format';

export class TpSlInputs {
  readonly page: Page;

  readonly toggleCheckbox: Locator;
  readonly tpGainInput: Locator;
  readonly tpTriggerInput: Locator;
  readonly slLossInput: Locator;
  readonly slTriggerInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.toggleCheckbox = this.page.getByTestId('order-settings-tpsl-checkbox');
    this.tpGainInput = this.page.getByTestId(
      'order-settings-tp-gain-or-loss-input',
    );
    this.tpTriggerInput = this.page.getByTestId(
      'order-settings-tp-trigger-price-input',
    );
    this.slLossInput = this.page.getByTestId(
      'order-settings-sl-gain-or-loss-input',
    );
    this.slTriggerInput = this.page.getByTestId(
      'order-settings-sl-trigger-price-input',
    );
  }

  async setTakeProfit(data: TakeProfitInput) {
    // TODO: Add option for switch between percentage and absolute value
    if (data.gain) {
      await this.tpGainInput.fill(data.gain);
    }

    // TODO: Add option for switch between Last Price, Oracle Price and Mid Price
    if (data.triggerPrice) {
      await this.tpTriggerInput.fill(data.triggerPrice.toString());
    }
  }

  async setStopLoss(data: StopLossInput) {
    // TODO: Add option for switch between percentage and absolute value
    if (data.loss) {
      await this.slLossInput.fill(data.loss);
    }

    // TODO: Add option for switch between Last Price, Oracle Price and Mid Price
    if (data.triggerPrice) {
      await this.slTriggerInput.fill(data.triggerPrice.toString());
    }
  }

  async setTpSl(data: TpSlInput) {
    await this.toggleCheckbox.setChecked(true);

    if (data.tp) {
      await this.setTakeProfit(data.tp);
    }
    if (data.sl) {
      await this.setStopLoss(data.sl);
    }
  }

  /** Returns both TP and SL trigger prices */
  async getTriggerPrices(): Promise<{ tp?: number; sl?: number }> {
    const tpValue = await this.tpTriggerInput.inputValue();
    const slValue = await this.slTriggerInput.inputValue();

    return {
      tp: tpValue ? getNumberFromText(tpValue) : undefined,
      sl: slValue ? getNumberFromText(slValue) : undefined,
    };
  }
}
