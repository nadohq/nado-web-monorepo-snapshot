import { BigNumber } from 'bignumber.js';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { OrderTableItem } from 'client/modules/tables/types/OrderTableItem';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';
import { RealizedPnlInfo } from 'client/modules/tables/utils/calcRealizedPnlInfo';

export interface HistoricalEngineOrderTableItem
  extends ProductTableItem, OrderTableItem {
  timePlacedMillis: number;
  filledAvgPrice: BigNumber;
  filledBaseSize: BigNumber;
  filledQuoteSize: BigNumber;
  tradeFeeQuote: BigNumber;

  realizedPnl: RealizedPnlInfo | undefined;
  /** Always positive */
  closedBaseSize: BigNumber | undefined;
  /** Signed position amount before the close. Positive for LONG, negative for SHORT */
  preClosePositionAmount: BigNumber | undefined;
  entryPrice: BigNumber | undefined;
  /** Derived via calcIsoPositionLeverage. null for cross-margin or when the order does not close a position */
  isoLeverage: number | null;

  /** Millis timestamp of the last fill */
  lastFillTimeMillis: number;

  statusText: string;

  marginModeType: MarginModeType;
}
