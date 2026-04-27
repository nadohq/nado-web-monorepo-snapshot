import { BalanceSide } from '@nadohq/client';
import { Locator, Page } from '@playwright/test';

import { ClosePositionDialog } from 'src/components/dialogs/ClosePositionDialog';
import { ManageTpSlDialog } from 'src/components/dialogs/ManageTpSlDialog';
import { ReversePositionDialog } from 'src/components/dialogs/ReversePositionDialog';
import { BaseRow } from 'src/components/tables/BaseRow';
import { MarginMode } from 'src/types/commonTypes';
import { Position } from 'src/types/positionTypes';

/**
 * Represents a single position row with access to all its data and actions.
 * Uses data-testid attributes for reliable element selection.
 */
export class PerpPositionRow extends BaseRow<Position> {
  readonly page: Page;
  readonly marketName: Locator;
  readonly directionLabel: Locator;
  readonly marginModeLabel: Locator;

  readonly size: Locator;
  readonly value: Locator;
  readonly entryPrice: Locator;
  readonly oraclePrice: Locator;
  readonly estLiqPrice: Locator;
  readonly tpslPrices: Locator;
  readonly tpslAddButton: Locator;
  readonly tpslManageButton: Locator;
  readonly estPnl: Locator;
  readonly margin: Locator;
  readonly funding: Locator;

  readonly reverseButton: Locator;
  readonly limitCloseButton: Locator;
  readonly marketCloseButton: Locator;

  constructor(page: Page, container: Locator, index: number) {
    super(container, index);
    this.page = page;

    // Market info (left row)
    this.marketName = this.leftRow.getByTestId(
      'perp-positions-table-market-name',
    );
    this.directionLabel = this.leftRow.getByTestId(
      'perp-positions-table-direction-label',
    );
    this.marginModeLabel = this.leftRow.getByTestId(
      'perp-positions-table-margin-mode',
    );

    // Position data (center row)
    this.size = this.centerRow.getByTestId('perp-positions-table-size');
    this.value = this.centerRow.getByTestId('perp-positions-table-value');
    this.entryPrice = this.centerRow.getByTestId(
      'perp-positions-table-entry-price',
    );
    this.oraclePrice = this.centerRow.getByTestId(
      'perp-positions-table-oracle-price',
    );
    this.estLiqPrice = this.centerRow.getByTestId(
      'perp-positions-table-estimated-liquidation-price',
    );
    this.tpslPrices = this.centerRow.getByTestId(
      'perp-positions-table-tp-sl-prices',
    );
    this.tpslAddButton = this.centerRow.getByTestId(
      'perp-positions-table-tp-sl-add-button',
    );
    this.tpslManageButton = this.centerRow.getByTestId(
      'perp-positions-table-manage-tp-sl-button',
    );
    this.estPnl = this.centerRow.getByTestId(
      'perp-positions-table-estimated-pnl',
    );
    this.margin = this.centerRow.getByTestId('perp-positions-table-margin');
    this.funding = this.centerRow.getByTestId('perp-positions-table-funding');

    // Action buttons (right row)
    this.reverseButton = this.rightRow.getByTestId(
      'perp-positions-table-reverse-position-button',
    );
    this.limitCloseButton = this.rightRow.getByTestId(
      'perp-positions-table-limit-close-position-button',
    );
    this.marketCloseButton = this.rightRow.getByTestId(
      'perp-positions-table-market-close-position-button',
    );
  }

  /**
   * Extracts all data from the position row.
   * @returns Promise resolving to the full position data.
   */
  async getData(): Promise<Position> {
    const market = (await this.marketName.innerText()).trim();
    const directionText = (await this.directionLabel.innerText()).trim();
    const direction: BalanceSide = directionText === 'Long' ? 'long' : 'short';

    const marginModeText = (await this.marginModeLabel.innerText()).trim();
    const marginMode =
      marginModeText === 'Cross' ? MarginMode.Cross : MarginMode.Isolated;

    const size = (await this.size.innerText()).trim();
    const value = (await this.value.innerText()).trim();
    const entryPrice = (await this.entryPrice.innerText()).trim();
    const oraclePrice = (await this.oraclePrice.innerText()).trim();
    const estLiqPrice = (await this.estLiqPrice.innerText()).trim();

    // TP/SL can be either prices or an "Add" button
    let tpsl = 'Add';
    if (await this.tpslPrices.isVisible()) {
      tpsl = (await this.tpslPrices.innerText()).trim();
    }

    const estPnl = (await this.estPnl.innerText()).trim();
    const margin = (await this.margin.innerText()).trim();
    const funding = (await this.funding.innerText()).trim();

    return {
      market,
      direction,
      marginMode,
      size,
      value,
      entryPrice,
      oraclePrice,
      estLiqPrice,
      tpsl,
      estPnl,
      margin,
      funding,
    };
  }

  /** Clicks the market close button on the position row and returns the close position dialog. */
  async clickMarketClose(): Promise<ClosePositionDialog> {
    await this.marketCloseButton.click();

    return new ClosePositionDialog(this.page);
  }

  /** Clicks the limit close button on the position row. */
  async clickLimitClose(): Promise<void> {
    await this.limitCloseButton.click();
  }

  /**
   * Clicks the reverse button and returns the Reverse Position dialog.
   * @returns Promise resolving to the ReversePositionDialog instance.
   */
  async clickReverse(): Promise<ReversePositionDialog> {
    await this.reverseButton.click();

    return new ReversePositionDialog(this.page);
  }

  /**
   * Clicks the "Manage" button on the TP/SL cell and returns the Manage TP/SL dialog.
   * @returns Promise resolving to the ManageTpSlDialog instance.
   */
  async clickManageTpSl(): Promise<ManageTpSlDialog> {
    await this.tpslManageButton.click();

    return new ManageTpSlDialog(this.page);
  }

  /**
   * Clicks the "Add" button on the TP/SL cell and returns the Manage TP/SL dialog.
   * @returns Promise resolving to the ManageTpSlDialog instance.
   */
  async clickAddTpSl(): Promise<ManageTpSlDialog> {
    await this.tpslAddButton.click();

    return new ManageTpSlDialog(this.page);
  }
}
