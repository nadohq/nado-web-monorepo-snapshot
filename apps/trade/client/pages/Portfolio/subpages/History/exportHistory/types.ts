import { CsvDataItem } from '@nadohq/web-common';
import { TriggerReferencePriceType } from 'client/modules/trading/types/TriggerReferencePriceType';

/**
 *  NumberAsString represents a number/BigNumber serialized to string for CSV export.
 *  This is more self-documenting than just using `string`
 */
type NumberAsString = string;

export type HistoryExportType =
  | 'trades'
  | 'historical_engine_orders'
  | 'historical_stop_orders'
  | 'historical_tp_sl'
  | 'historical_twap'
  | 'funding_payments'
  | 'interest_payments'
  | 'deposits'
  | 'withdrawals'
  | 'transfers'
  | 'nlp'
  | 'settlements'
  | 'liquidations';

export interface ExportHistoryDialogParams {
  initialExportType?: HistoryExportType;
}

export interface GetExportHistoryDataParams {
  startTimeMillis: number;
  endTimeMillis: number;
  type: HistoryExportType;
}

export interface ExportHistoryDepositItem extends CsvDataItem {
  time: Date;
  /** Symbol */
  asset: string;
  balanceChange: NumberAsString;
}

export interface ExportHistoryTransferItem extends CsvDataItem {
  time: Date;
  /** Symbol */
  asset: string;
  balanceChange: NumberAsString;
  fromSubaccountName: string;
  toSubaccountName: string;
}

export interface ExportHistoryWithdrawalItem extends CsvDataItem {
  time: Date;
  /** Symbol */
  asset: string;
  balanceChange: NumberAsString;
}

export interface ExportHistoryTradeItem extends CsvDataItem {
  time: Date;
  marketName: string;
  direction: string;
  marginModeType: string;
  price: NumberAsString;
  amount: NumberAsString;
  total: NumberAsString;
  fee: NumberAsString;
  /** undefined if trade did not realize any pnl */
  realizedPnl: NumberAsString | undefined;
  closedSize: NumberAsString | undefined;
  orderId: string;
}

export interface ExportHistoryNlpItem extends CsvDataItem {
  time: Date;
  nlpAmountDelta: NumberAsString;
  primaryQuoteAmountDelta: NumberAsString;
}

export interface ExportHistorySettlementItem extends CsvDataItem {
  time: Date;
  marketName: string;
  positionAmount: NumberAsString;
  settlementQuoteAmount: NumberAsString;
}

export interface ExportHistoryLiquidationItem extends CsvDataItem {
  time: Date;
  /** For spot, this is the symbol. For perps, this is the market name */
  productName: string;
  balanceType: string;
  marginModeType: string;
  /** Used as an "ID" to group liquidations */
  submissionIndex: string;
  amountLiquidated: NumberAsString;
  liquidatedValueUsd: NumberAsString;
}

export interface ExportHistoryFundingItem extends CsvDataItem {
  time: Date;
  marketName: string;
  annualRateFrac: NumberAsString;
  fundingPaymentAmount: NumberAsString;
}

export interface ExportHistoryInterestItem extends CsvDataItem {
  time: Date;
  asset: string;
  annualRateFrac: NumberAsString;
  interestPaymentAmount: NumberAsString;
}

export interface ExportHistoryEngineOrderItem extends CsvDataItem {
  time: Date;
  marketName: string;
  orderType: string;
  direction: string;
  marginModeType: string;
  orderPrice: NumberAsString;
  filledSize: NumberAsString;
  totalSize: NumberAsString;
  reduceOnly: string;
  /** undefined if order did not reduce position */
  realizedPnl: NumberAsString | undefined;
  closedSize: NumberAsString | undefined;
  status: string;
  orderId: string;
}

export interface ExportHistoryPriceTriggerOrderItem extends CsvDataItem {
  time: Date;
  marketName: string;
  orderType: string;
  direction: string;
  marginModeType: string;
  /** string type for 'Market' */
  orderPrice: NumberAsString | string;
  filledAvgPrice: NumberAsString | undefined;
  filledSize: NumberAsString | undefined;
  /** string type for 'Entire Position' */
  totalSize: NumberAsString | string;
  triggerPrice: NumberAsString;
  triggerReferencePriceType: TriggerReferencePriceType;
  reduceOnly: string;
  status: string;
  statusDetails: string | undefined;
  orderId: string;
}

export interface ExportHistoryTimeTriggerOrderItem extends CsvDataItem {
  time: Date;
  marketName: string;
  orderType: string;
  direction: string;
  marginModeType: string;
  filledAvgPrice: NumberAsString | undefined;
  filledSize: NumberAsString | undefined;
  totalSize: NumberAsString;
  reduceOnly: string;
  frequencyInSeconds: number;
  runtimeInSeconds: number;
  status: string;
  statusDetails: string | undefined;
  orderId: string;
}
