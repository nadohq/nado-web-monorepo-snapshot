import { BigNumber } from 'bignumber.js';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { OrderTableItem } from 'client/modules/tables/types/OrderTableItem';
import { ProductTableItem } from 'client/modules/tables/types/ProductTableItem';
import { RealizedPnlInfo } from 'client/modules/tables/utils/calcRealizedPnlInfo';

export interface HistoricalTradesTableItem
  extends ProductTableItem, OrderTableItem {
  submissionIndex: string;
  timeFilledMillis: number;
  filledPrice: BigNumber;
  filledBaseSize: BigNumber;
  filledQuoteSize: BigNumber;
  tradeFeeQuote: BigNumber;
  closedBaseSize: BigNumber | undefined;
  marginModeType: MarginModeType;
  /** Derived via calcIsoPositionLeverage. null for cross-margin or when the trade does not close a position */
  isoLeverage: number | null;
  averageEntryPrice: BigNumber | undefined;
  /** Signed position amount before the close. Positive for LONG, negative for SHORT */
  preClosePositionAmount: BigNumber | undefined;

  realizedPnl: RealizedPnlInfo | undefined;
}
