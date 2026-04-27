import { BalanceSide } from '@nadohq/client';
import { Page } from '@playwright/test';
import { LeverageDialog } from 'src/components/dialogs/LeverageDialog';
import { BaseOrderForm } from 'src/components/trading/BaseOrderForm';
import { PerpConsoleHeader } from 'src/components/trading/perp/PerpConsoleHeader';
import { MarginMode } from 'src/types/commonTypes';

export class PerpOrderForm extends BaseOrderForm<PerpConsoleHeader> {
  constructor(page: Page) {
    const header: PerpConsoleHeader = new PerpConsoleHeader(page);
    super(page, header);
  }

  async configure(data: {
    side: BalanceSide;
    marginMode?: MarginMode;
    leverage?: string;
  }) {
    await this.header.configure({
      marginMode: data.marginMode,
      side: data.side,
    });

    if (data.leverage) {
      await this.selectLeverage(data.leverage);
    }
  }

  async selectLeverage(leverage: string) {
    await this.header.leverageButton.click();

    const leverageDialog = new LeverageDialog(this.page);
    await leverageDialog.fillLeverage(leverage);
    await leverageDialog.confirmButton.click();
  }
}
