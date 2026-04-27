import { removeDecimals, toBigNumber, TriggerOrderInfo } from '@nadohq/client';
import {
  calcPnl,
  formatNumber,
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Icons, TextButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { CancellableOrderWithNotificationInfo } from 'client/hooks/execute/cancelOrder/types';
import { useExecuteCancelOrdersWithNotification } from 'client/hooks/execute/cancelOrder/useExecuteCancelOrdersWithNotification';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useCanUserExecute } from 'client/hooks/subaccount/useCanUserExecute';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MARKET_ORDER_EXECUTION_TYPE } from 'client/modules/trading/consts/marketOrderExecutionType';
import { isTpSlMaxOrderSize } from 'client/modules/trading/tpsl/utils/isTpSlMaxOrderSize';
import { getOrderTypeLabel } from 'client/modules/trading/utils/getOrderTypeLabel';
import { requirePriceTriggerCriteria } from 'client/modules/trading/utils/trigger/getPriceTriggerCriteria';
import { getTriggerOrderDisplayType } from 'client/modules/trading/utils/trigger/getTriggerOrderDisplayType';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { sortBy } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  orders: TriggerOrderInfo[] | undefined;
  productId: number;
  gapClassName: string;
  showActionButtons?: boolean;
  averageEntryPrice: BigNumber | undefined;
  positionAmount: BigNumber | undefined;
}

/**
 * Table to preview TP/SL orders with optional action buttons
 */
export function TpSlOrdersPreviewTable({
  orders,
  showActionButtons,
  gapClassName,
  productId,
  className,
  averageEntryPrice,
  positionAmount,
}: Props) {
  const { t } = useTranslation();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const { cancelOrdersWithNotification, status: cancelStatus } =
    useExecuteCancelOrdersWithNotification();
  const canUserExecute = useCanUserExecute();
  const { push } = useDialog();

  const staticMarketData = allMarketsStaticData?.allMarkets[productId];

  // Sort orders by trigger price in descending order to show the highest price first
  const sortedOrders = useMemo(() => {
    return sortBy(orders ?? [], triggerPriceSortByFn).reverse();
  }, [orders]);

  return (
    <div
      className={joinClassNames(
        'grid text-left text-xs whitespace-nowrap',
        gapClassName,
        className,
      )}
      style={{
        gridTemplateColumns: `64px repeat(4, 1fr) ${showActionButtons ? 'auto' : ''}`,
      }}
    >
      {/* Header */}
      <div className="text-text-tertiary contents">
        <span>{t(($) => $.tpslAbbrev)}</span>
        <span>{t(($) => $.triggerPrice)}</span>
        <span>{t(($) => $.orderPrice)}</span>
        <span>{t(($) => $.quantity)}</span>
        <span>{t(($) => $.estimatedAbbrevPnl)}</span>
        {showActionButtons && <div />}
      </div>

      {/* Rows */}
      {sortedOrders.map((triggerOrder) => {
        const { order } = triggerOrder;
        const orderDisplayType = getTriggerOrderDisplayType(triggerOrder);
        const orderAppendix = order.appendix;
        const priceTriggerCriteria = requirePriceTriggerCriteria(
          order.triggerCriteria,
        );

        const priceFormatSpecifier = getMarketPriceFormatSpecifier(
          staticMarketData?.priceIncrement,
        );
        const sizeFormatSpecifier = getMarketSizeFormatSpecifier({
          sizeIncrement: staticMarketData?.sizeIncrement,
        });

        const orderTypeLabel = getOrderTypeLabel({
          t,
          orderAppendix,
          orderSide: order.amount.isPositive() ? 'long' : 'short',
          priceTriggerCriteria,
        });
        const orderTypeColor =
          orderDisplayType === 'take_profit'
            ? 'text-positive'
            : 'text-negative';

        // Trigger price
        const triggerPrice = priceTriggerCriteria.triggerPrice;
        const formattedTriggerPrice = formatNumber(triggerPrice, {
          formatSpecifier: priceFormatSpecifier,
        });

        // Order price - show "Market" for market orders, otherwise show price
        const isMarketOrder =
          orderAppendix.orderExecutionType === MARKET_ORDER_EXECUTION_TYPE;
        const orderPriceDisplay = isMarketOrder
          ? t(($) => $.market)
          : formatNumber(order.price, {
              formatSpecifier: priceFormatSpecifier,
            });

        // Quantity - show "All" for max size orders, we typically show "Entire Position"
        // here but space does not permit on mobile
        const orderAmount = removeDecimals(order.amount);
        const isEntirePosition = isTpSlMaxOrderSize(orderAmount);
        const quantityDisplay = isEntirePosition
          ? t(($) => $.all)
          : formatNumber(orderAmount.abs(), {
              formatSpecifier: sizeFormatSpecifier,
            });

        // Estimated PnL - calculate using order amount and execution price.
        // For limit orders, use the limit price; for market orders, use trigger price.
        // For "entire position" orders, use positionAmount.
        // Note: order amount is negative for closing longs, positive for closing shorts,
        // so we negate it to get the position amount being closed.
        const estimatedPnl = (() => {
          if (!averageEntryPrice) {
            return undefined;
          }

          const amountToClose =
            isEntirePosition && positionAmount
              ? positionAmount
              : orderAmount.negated();

          // For limit orders, use the limit price as that's the execution price.
          // For market orders, use trigger price as an estimate.
          const executionPrice = isMarketOrder ? triggerPrice : order.price;
          // Net entry is the average entry price multiplied by the amount to close
          const netEntry = amountToClose.multipliedBy(averageEntryPrice);

          return calcPnl(amountToClose, toBigNumber(executionPrice), netEntry);
        })();

        const formattedEstimatedPnl = formatNumber(estimatedPnl, {
          formatSpecifier: PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP,
        });
        const estimatedPnlColor = getSignDependentColorClassName(estimatedPnl);

        const cancelOrder = () => {
          const cancellableOrder: CancellableOrderWithNotificationInfo = {
            productId: order.productId,
            digest: order.digest,
            isTrigger: true,
            decimalAdjustedTotalAmount: orderAmount,
            orderDisplayType,
          };

          cancelOrdersWithNotification({
            orders: [cancellableOrder],
          });
        };
        const isCancelling = cancelStatus === 'pending';

        const cellClassName = 'flex items-center';

        return (
          <div
            key={order.digest}
            className="contents"
            data-testid="manage-tp-sl-dialog-orders-table-row"
          >
            <span
              className={joinClassNames(orderTypeColor, cellClassName)}
              data-testid="manage-tp-sl-dialog-orders-table-order-type"
            >
              {orderTypeLabel}
            </span>
            <span
              className={cellClassName}
              data-testid="manage-tp-sl-dialog-orders-table-trigger-price"
            >
              {formattedTriggerPrice}
            </span>
            <span
              className={cellClassName}
              data-testid="manage-tp-sl-dialog-orders-table-order-price"
            >
              {orderPriceDisplay}
            </span>
            <span
              className={cellClassName}
              data-testid="manage-tp-sl-dialog-orders-table-quantity"
            >
              {quantityDisplay}
            </span>
            <span
              className={joinClassNames(estimatedPnlColor, cellClassName)}
              data-testid="manage-tp-sl-dialog-orders-table-estimated-pnl"
            >
              {formattedEstimatedPnl}
            </span>
            {showActionButtons && (
              <div className="flex items-center justify-end gap-x-0.5">
                <TextButton
                  colorVariant="tertiary"
                  disabled={isCancelling}
                  data-testid="manage-tp-sl-dialog-orders-table-modify-button"
                  onClick={() =>
                    push({
                      type: 'modify_tp_sl',
                      params: {
                        productId,
                        order: triggerOrder,
                        isIso: !!order.appendix.isolated,
                      },
                    })
                  }
                >
                  <Icons.PencilSimpleFill size={16} />
                </TextButton>
                <TextButton
                  colorVariant="tertiary"
                  disabled={isCancelling || !canUserExecute}
                  onClick={cancelOrder}
                  data-testid="manage-tp-sl-dialog-orders-table-cancel-button"
                >
                  <Icons.Trash size={16} />
                </TextButton>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function triggerPriceSortByFn(order: TriggerOrderInfo): number {
  const priceTriggerCriteria = requirePriceTriggerCriteria(
    order.order.triggerCriteria,
  );

  return toBigNumber(priceTriggerCriteria.triggerPrice).toNumber();
}
