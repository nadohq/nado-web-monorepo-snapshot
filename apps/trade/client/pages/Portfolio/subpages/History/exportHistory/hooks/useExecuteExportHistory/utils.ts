import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import {
  ExportHistoryDepositItem,
  ExportHistoryEngineOrderItem,
  ExportHistoryFundingItem,
  ExportHistoryInterestItem,
  ExportHistoryLiquidationItem,
  ExportHistoryNlpItem,
  ExportHistoryPriceTriggerOrderItem,
  ExportHistorySettlementItem,
  ExportHistoryTimeTriggerOrderItem,
  ExportHistoryTradeItem,
  ExportHistoryTransferItem,
  ExportHistoryWithdrawalItem,
  GetExportHistoryDataParams,
  HistoryExportType,
} from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import type { TFunction } from 'i18next';
import { clamp } from 'lodash';

export function updateProgressFrac(
  { startTimeMillis, endTimeMillis }: GetExportHistoryDataParams,
  { setProgressFrac }: GetExportHistoryDataContext,
  earliestItemDate: Date | undefined,
) {
  if (!earliestItemDate) {
    return;
  }

  const earliestMillis = earliestItemDate.getTime();
  const progressFrac = clamp(
    (endTimeMillis - earliestMillis) / (endTimeMillis - startTimeMillis),
    0,
    1,
  );
  setProgressFrac(progressFrac);
}

/*
 * CSV Headings
 * IMPORTANT: These must be declared in the order that the columns should appear in the CSV.
 * Ex: If the order of the columns should be time, asset, size, then the order of the keys in the object should be time, asset, size.
 */
type HeadingsForItem<TData> = Record<keyof TData, string>;

export const getExportHistoryHeadingsByType = (t: TFunction) => {
  const baseCollateralHeadings: HeadingsForItem<
    ExportHistoryDepositItem | ExportHistoryWithdrawalItem
  > = {
    time: t(($) => $.exportHeadings.time),
    asset: t(($) => $.exportHeadings.asset),
    balanceChange: t(($) => $.exportHeadings.balanceChange),
  };

  const transfers: HeadingsForItem<ExportHistoryTransferItem> = {
    ...baseCollateralHeadings,
    fromSubaccountName: t(($) => $.exportHeadings.from),
    toSubaccountName: t(($) => $.exportHeadings.to),
    fromSubaccountDisplayName: t(($) => $.exportHeadings.fromDisplayName),
    toSubaccountDisplayName: t(($) => $.exportHeadings.toDisplayName),
  };

  const settlements: HeadingsForItem<ExportHistorySettlementItem> = {
    time: t(($) => $.exportHeadings.time),
    marketName: t(($) => $.exportHeadings.market),
    positionAmount: t(($) => $.exportHeadings.positionAmount),
    settlementQuoteAmount: t(($) => $.exportHeadings.settlementAmount),
  };

  const liquidations: HeadingsForItem<ExportHistoryLiquidationItem> = {
    time: t(($) => $.exportHeadings.time),
    submissionIndex: t(($) => $.exportHeadings.liquidationId),
    balanceType: t(($) => $.exportHeadings.type),
    marginModeType: t(($) => $.exportHeadings.marginType),
    productName: t(($) => $.exportHeadings.product),
    amountLiquidated: t(($) => $.exportHeadings.amountLiquidated),
    liquidatedValueUsd: t(($) => $.exportHeadings.liquidatedValue),
  };

  const nlp: HeadingsForItem<ExportHistoryNlpItem> = {
    time: t(($) => $.exportHeadings.time),
    nlpAmountDelta: t(($) => $.exportHeadings.nlpTokensChange),
    primaryQuoteAmountDelta: t(($) => $.exportHeadings.quoteChange),
  };

  const trades: HeadingsForItem<ExportHistoryTradeItem> = {
    time: t(($) => $.exportHeadings.time),
    marketName: t(($) => $.exportHeadings.market),
    direction: t(($) => $.exportHeadings.direction),
    marginModeType: t(($) => $.exportHeadings.marginType),
    amount: t(($) => $.exportHeadings.amount),
    price: t(($) => $.exportHeadings.price),
    fee: t(($) => $.exportHeadings.fee),
    total: t(($) => $.exportHeadings.total),
    realizedPnl: t(($) => $.exportHeadings.realizedPnl),
    closedSize: t(($) => $.exportHeadings.closedSizeRealizedPnl),
    orderId: t(($) => $.exportHeadings.orderId),
  };

  const funding: HeadingsForItem<ExportHistoryFundingItem> = {
    time: t(($) => $.exportHeadings.time),
    marketName: t(($) => $.exportHeadings.market),
    annualRateFrac: t(($) => $.exportHeadings.annualizedFundingRate),
    fundingPaymentAmount: t(($) => $.exportHeadings.fundingPaymentAmount),
  };

  const interest: HeadingsForItem<ExportHistoryInterestItem> = {
    time: t(($) => $.exportHeadings.time),
    asset: t(($) => $.exportHeadings.asset),
    annualRateFrac: t(($) => $.exportHeadings.annualizedInterestRate),
    interestPaymentAmount: t(($) => $.exportHeadings.interestPaymentAmount),
  };

  const engineOrders: HeadingsForItem<ExportHistoryEngineOrderItem> = {
    time: t(($) => $.exportHeadings.time),
    marketName: t(($) => $.exportHeadings.market),
    orderType: t(($) => $.exportHeadings.orderType),
    direction: t(($) => $.exportHeadings.direction),
    marginModeType: t(($) => $.exportHeadings.marginType),
    orderPrice: t(($) => $.exportHeadings.orderPrice),
    filledSize: t(($) => $.exportHeadings.filledSize),
    totalSize: t(($) => $.exportHeadings.totalSize),
    reduceOnly: t(($) => $.exportHeadings.reduceOnly),
    realizedPnl: t(($) => $.exportHeadings.realizedPnl),
    closedSize: t(($) => $.exportHeadings.closedSizeRealizedPnl),
    status: t(($) => $.exportHeadings.status),
    orderId: t(($) => $.exportHeadings.orderId),
  };

  const priceTriggerOrders: HeadingsForItem<ExportHistoryPriceTriggerOrderItem> =
    {
      time: t(($) => $.exportHeadings.time),
      marketName: t(($) => $.exportHeadings.market),
      direction: t(($) => $.exportHeadings.direction),
      orderType: t(($) => $.exportHeadings.orderType),
      marginModeType: t(($) => $.exportHeadings.marginType),
      orderPrice: t(($) => $.exportHeadings.price),
      filledAvgPrice: t(($) => $.exportHeadings.avgFilledPrice),
      filledSize: t(($) => $.exportHeadings.filledSize),
      totalSize: t(($) => $.exportHeadings.totalSize),
      triggerPrice: t(($) => $.exportHeadings.triggerPrice),
      triggerReferencePriceType: t(($) => $.exportHeadings.referencePrice),
      reduceOnly: t(($) => $.exportHeadings.reduceOnly),
      status: t(($) => $.exportHeadings.status),
      statusDetails: t(($) => $.exportHeadings.statusDetails),
      orderId: t(($) => $.exportHeadings.orderId),
    };

  const timeTriggerOrders: HeadingsForItem<ExportHistoryTimeTriggerOrderItem> =
    {
      time: t(($) => $.exportHeadings.time),
      marketName: t(($) => $.exportHeadings.market),
      direction: t(($) => $.exportHeadings.direction),
      orderType: t(($) => $.exportHeadings.orderType),
      marginModeType: t(($) => $.exportHeadings.marginType),
      filledAvgPrice: t(($) => $.exportHeadings.avgFilledPrice),
      filledSize: t(($) => $.exportHeadings.filledSize),
      totalSize: t(($) => $.exportHeadings.totalSize),
      reduceOnly: t(($) => $.exportHeadings.reduceOnly),
      frequencyInSeconds: t(($) => $.exportHeadings.frequencySeconds),
      runtimeInSeconds: t(($) => $.exportHeadings.runtimeSeconds),
      status: t(($) => $.exportHeadings.status),
      statusDetails: t(($) => $.exportHeadings.statusDetails),
      orderId: t(($) => $.exportHeadings.orderId),
    };

  return {
    deposits: baseCollateralHeadings,
    withdrawals: baseCollateralHeadings,
    transfers,
    nlp,
    settlements,
    liquidations,
    trades,
    funding_payments: funding,
    interest_payments: interest,
    historical_engine_orders: engineOrders,
    historical_stop_orders: priceTriggerOrders,
    historical_tp_sl: priceTriggerOrders,
    historical_twap: timeTriggerOrders,
  } satisfies Record<HistoryExportType, Record<string, string>>;
};
