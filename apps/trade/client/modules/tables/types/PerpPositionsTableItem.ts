import { TriggerOrderInfo } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';

export interface PerpPositionsTableItem
  extends ProductTableItem, WithDataTableRowId {
  isoSubaccountName: string | undefined;
  positionAmount: BigNumber;
  positionSize: BigNumber;
  notionalValueUsd: BigNumber;
  netFunding: BigNumber | undefined;
  margin: {
    crossMarginUsedUsd: BigNumber | undefined;
    isoMarginUsedUsd: BigNumber | undefined;
    isoLeverage: number | null;
    marginModeType: MarginModeType;
  };
  pnlInfo: {
    estimatedPnlUsd: BigNumber | undefined;
    estimatedPnlFrac: BigNumber | undefined;
  };
  estimatedLiquidationPrice: BigNumber | null;
  averageEntryPrice: BigNumber | undefined;
  oraclePrice: BigNumber;
  /** The estimated exit price based on orderbook prices. Used for PnL calculations and PnL sharing. */
  estimatedExitPrice: BigNumber;
  tpSl: {
    tpTriggerPrice: BigNumber | undefined;
    slTriggerPrice: BigNumber | undefined;
    allOrders: TriggerOrderInfo[] | undefined;
    /**
     * True if there are >1 TP or >1 SL orders. Under this condition, an alternative UI is shown in the table cell
     * to indicate multiple orders exist.
     */
    hasMultipleTpOrSlOrders: boolean;
  };
}
