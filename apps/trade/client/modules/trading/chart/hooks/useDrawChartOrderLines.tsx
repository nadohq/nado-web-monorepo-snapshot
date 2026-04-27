import {
  asyncResult,
  OrderAppendix,
  PriceTriggerCriteria,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import {
  formatNumber,
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
} from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import {
  CancelOrdersResult,
  CancelOrdersWithNotificationParams,
} from 'client/hooks/execute/cancelOrder/types';
import { useExecuteCancelOrdersWithNotification } from 'client/hooks/execute/cancelOrder/useExecuteCancelOrdersWithNotification';
import { useExecuteModifyOrder } from 'client/hooks/execute/modifyOrder/useExecuteModifyOrder';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useQuerySubaccountOpenEngineOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenEngineOrders';
import { useQuerySubaccountOpenTriggerOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenTriggerOrders';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { DialogParams } from 'client/modules/app/dialogs/types';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { DispatchNotificationParams } from 'client/modules/notifications/types';
import { getResolvedColorValue } from 'client/modules/theme/colorVars';
import { TradingViewSymbolInfo } from 'client/modules/trading/chart/config/datafeedConfig';
import { useEnableTradingOrderLines } from 'client/modules/trading/hooks/useEnableTradingOrderLines';
import { isTpSlMaxOrderSize } from 'client/modules/trading/tpsl/utils/isTpSlMaxOrderSize';
import { OrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';
import { getOrderTypeLabel } from 'client/modules/trading/utils/getOrderTypeLabel';
import { getIsTriggerPriceAbove } from 'client/modules/trading/utils/trigger/getIsTriggerPriceAbove';
import { getPriceTriggerCriteria } from 'client/modules/trading/utils/trigger/getPriceTriggerCriteria';
import { getTriggerOrderDisplayType } from 'client/modules/trading/utils/trigger/getTriggerOrderDisplayType';
import type { TFunction } from 'i18next';
import { debounce } from 'lodash';
import {
  IChartingLibraryWidget,
  IChartWidgetApi,
  IOrderLineAdapter,
} from 'public/charting_library';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  tvWidget: IChartingLibraryWidget | undefined;
  loadedSymbolInfo: TradingViewSymbolInfo | undefined;
}

interface OrderInfo {
  price: BigNumber;
  totalAmount: BigNumber;
  productId: number;
  digest: string;
  orderDisplayType: OrderDisplayType;
  orderAppendix: OrderAppendix;
  priceTriggerCriteria: PriceTriggerCriteria | undefined;
}

type OrderLineByDigest = Map<string, IOrderLineAdapter>;

// A nested mapping of product ID -> order digest -> order line
type OrderLinesByProductId = Map<number, OrderLineByDigest>;

// Debounce delay when dragging to edit order
const MODIFY_DEBOUNCE_DELAY = 500;

export function useDrawChartOrderLines({ tvWidget, loadedSymbolInfo }: Params) {
  const { t } = useTranslation();

  const productId = loadedSymbolInfo?.productId;
  const existingLinesByProductId = useRef<OrderLinesByProductId>(new Map());

  const { enableTradingOrderLines } = useEnableTradingOrderLines();

  const { data: openEngineOrders } = useQuerySubaccountOpenEngineOrders();
  const { data: openTriggerOrders } = useQuerySubaccountOpenTriggerOrders();

  const { cancelOrdersWithNotification } =
    useExecuteCancelOrdersWithNotification();
  const { mutateAsync: modifyOrderAsync } = useExecuteModifyOrder();

  const { dispatchNotification } = useNotificationManagerContext();

  const { data: marketsStaticData } = useAllMarketsStaticData();

  // When TV Widget reloads, clear any cached lines as they are all removed
  useEffect(() => {
    existingLinesByProductId.current.clear();
  }, [tvWidget]);

  // When a user disables showing order lines, remove all existing lines
  useEffect(() => {
    if (!enableTradingOrderLines) {
      existingLinesByProductId.current.forEach((orderLines) => {
        orderLines.forEach((line) => line.remove());
      });
      existingLinesByProductId.current.clear();
    }
  }, [enableTradingOrderLines]);

  const ordersToDraw = useMemo((): OrderInfo[] => {
    // We can skip the expensive computation if order lines are not enabled
    // No components rely on enableTradingOrderLines, only the callback does
    if (!productId || !enableTradingOrderLines) {
      return [];
    }

    const mappedEngineOrders: OrderInfo[] =
      openEngineOrders?.[productId]?.map((engineOrder) => {
        const { price, totalAmount, productId, digest } = engineOrder;

        return {
          price,
          totalAmount,
          productId,
          digest,
          orderDisplayType: 'limit',
          orderAppendix: engineOrder.appendix,
          priceTriggerCriteria: undefined,
        };
      }) ?? [];

    const mappedTriggerOrders: OrderInfo[] =
      openTriggerOrders?.[productId]
        ?.map((openTriggerOrder) => {
          const { order } = openTriggerOrder;

          // Only show price-trigger orders
          const priceTriggerCriteria = getPriceTriggerCriteria(
            order.triggerCriteria,
          );
          if (!priceTriggerCriteria) {
            return;
          }

          return {
            price: toBigNumber(priceTriggerCriteria.triggerPrice),
            totalAmount: order.amount,
            productId: order.productId,
            digest: order.digest,
            orderAppendix: order.appendix,
            priceTriggerCriteria,
            orderDisplayType: getTriggerOrderDisplayType(openTriggerOrder),
          };
        })
        .filter(nonNullFilter) ?? [];

    return [...mappedEngineOrders, ...mappedTriggerOrders];
  }, [enableTradingOrderLines, openEngineOrders, openTriggerOrders, productId]);

  // Upon moving a line, we show a dialog to the user about editing orders via the chart.
  // These values are used within `attachOrderLineActions` to show the dialog.
  const { show } = useDialog();

  return useCallback(() => {
    const selectedProductId = loadedSymbolInfo?.productId;

    if (
      !tvWidget ||
      !selectedProductId ||
      !marketsStaticData?.allMarkets[selectedProductId]
    ) {
      return;
    }

    const activeChart = tvWidget.activeChart();

    const existingOrderLines: OrderLineByDigest =
      existingLinesByProductId.current.get(selectedProductId) ?? new Map();

    const newOrderLines: OrderLineByDigest = new Map();

    // Draw lines for relevant orders if needed
    ordersToDraw.forEach((relevantOrder: OrderInfo) => {
      const { digest, price } = relevantOrder;

      const existingLine = existingOrderLines.get(digest);
      if (existingLine) {
        // Replace the line if it already exists, note that we don't need to
        // update the line, because orders cannot be modified after they are placed (they can only be cancelled and re-placed)
        newOrderLines.set(digest, existingLine);
      } else {
        // Create a new line if it doesn't exist
        console.debug(
          '[useDrawChartOrderLines]: Creating order line:',
          digest,
          price.toNumber(),
        );

        // Create the TV orderline and add it to the map
        const line = createOrderLine(
          t,
          activeChart,
          relevantOrder,
          marketsStaticData?.allMarkets[selectedProductId],
        );

        attachOrderLineActions({
          t,
          line,
          relevantOrder,
          modifyOrderAsync,
          cancelOrdersWithNotification,
          show,
          dispatchNotification,
        });

        newOrderLines.set(digest, line);
      }
    });

    // Remove lines no longer relevant ie) those in existingOrderLines but not in newOrderLines
    existingOrderLines.forEach((line, digest) => {
      if (!newOrderLines.has(digest)) {
        console.debug('[useDrawChartOrderLines]: Removing order line:', digest);
        line.remove();
      }
    });

    existingLinesByProductId.current.set(selectedProductId, newOrderLines);
  }, [
    cancelOrdersWithNotification,
    modifyOrderAsync,
    marketsStaticData?.allMarkets,
    ordersToDraw,
    loadedSymbolInfo,
    tvWidget,
    show,
    dispatchNotification,
    t,
  ]);
}

function createOrderLine(
  t: TFunction,
  activeChart: IChartWidgetApi,
  order: OrderInfo,
  market: StaticMarketData,
): IOrderLineAdapter {
  const { orderAppendix, priceTriggerCriteria, totalAmount } = order;
  const decimalAdjustedAmount = removeDecimals(totalAmount);

  const isMaxSize = isTpSlMaxOrderSize(decimalAdjustedAmount);

  const isLongOrder = totalAmount.gte(0);

  const price = order.priceTriggerCriteria
    ? toBigNumber(order.priceTriggerCriteria.triggerPrice).toNumber()
    : order.price.toNumber();

  /**
   * Unlike the font fns which accept CSS variables, we need to use the actual color values here.
   * Otherwise the charting library will not render the colors correctly.
   */
  const primaryTextColor = getResolvedColorValue('text-primary');
  const secondaryTextColor = getResolvedColorValue('text-secondary');
  const backgroundColor = getResolvedColorValue('background');
  const positiveColor = getResolvedColorValue('positive');
  const negativeColor = getResolvedColorValue('negative');

  const sideColor = isLongOrder ? positiveColor : negativeColor;

  const amountText = isMaxSize
    ? t(($) => $.all).toUpperCase()
    : formatNumber(decimalAdjustedAmount.abs(), {
        formatSpecifier: getMarketSizeFormatSpecifier({
          sizeIncrement: market.sizeIncrement,
        }),
      });

  const comparatorSymbolContent = (() => {
    if (order.priceTriggerCriteria) {
      return getIsTriggerPriceAbove(order.priceTriggerCriteria.type)
        ? ' > '
        : ' < ';
    }

    return ' ';
  })();

  const orderTypeLabel = getOrderTypeLabel({
    t,
    orderAppendix,
    orderSide: isLongOrder ? 'long' : 'short',
    priceTriggerCriteria,
  });
  const marginTypeLabel = orderAppendix.isolated
    ? t(($) => $.isolatedAbbrev)
    : t(($) => $.cross);

  const contentText = `${orderTypeLabel} (${marginTypeLabel}) ${comparatorSymbolContent}${formatNumber(
    price,
    {
      formatSpecifier: getMarketPriceFormatSpecifier(market.priceIncrement),
    },
  )}`;

  return (
    activeChart
      .createOrderLine()
      .setPrice(price)
      // Distance from right side of chart to the limit order box, in % units
      .setLineLength(80)
      // Styling
      .setBodyTextColor(primaryTextColor)
      .setBodyBackgroundColor(backgroundColor)
      .setBodyBorderColor(sideColor)
      .setLineStyle(2) // we use 0 (solid) for position lines, 2 (dashed) for order lines
      .setLineColor(sideColor)
      .setBodyFont(`11px var(--font-default)`)
      .setText(contentText)
      .setQuantity(amountText)
      .setQuantityFont(`11px var(--font-default)`)
      .setQuantityTextColor(backgroundColor)
      .setQuantityBackgroundColor(sideColor)
      .setQuantityBorderColor(sideColor)
      .setCancelButtonBackgroundColor(backgroundColor)
      .setCancelButtonBorderColor(sideColor)
      .setCancelButtonIconColor(secondaryTextColor)
      .setTooltip(t(($) => $.tradingChart.dragToAdjustPriceTooltip))
  );
}

interface AttachOrderLineActionsParams {
  t: TFunction;
  line: IOrderLineAdapter;
  relevantOrder: OrderInfo;
  modifyOrderAsync: ReturnType<typeof useExecuteModifyOrder>['mutateAsync'];
  cancelOrdersWithNotification: (
    params: CancelOrdersWithNotificationParams,
  ) => Promise<CancelOrdersResult>;
  show: (dialog: DialogParams) => void;
  dispatchNotification: (params: DispatchNotificationParams) => void;
}

function attachOrderLineActions({
  t,
  line,
  relevantOrder,
  modifyOrderAsync,
  cancelOrdersWithNotification,
  show,
  dispatchNotification,
}: AttachOrderLineActionsParams) {
  // Append Drag-to-Edit action to the line
  line.onMove(
    // we debounce here to send the request when the user has stopped dragging
    debounce(async () => {
      // Show the edit order dialog, if the user has already seen it once, the dialog
      // will just return null and the promise will be immediately resolved
      await new Promise<void>((res) => {
        show({ type: 'edit_order_via_chart', params: { onClose: res } });
      });

      const newPrice = toBigNumber(line.getPrice());
      const {
        productId,
        digest,
        price: orderPrice,
        priceTriggerCriteria,
      } = relevantOrder;

      const originalLabel = line.getText();
      line.setText(`${t(($) => $.notifications.updating)}`); // inline feedback

      // For trigger orders, update the trigger price; for engine orders, update the order price
      const isPriceTrigger = !!priceTriggerCriteria;
      const modifyParams = isPriceTrigger
        ? { newTriggerPrice: newPrice, productId, digest, isPriceTrigger }
        : { newPrice, productId, digest, isPriceTrigger };

      const serverExecutionResult = modifyOrderAsync(modifyParams, {
        onError: () => {
          // modification failed, snap the line back to original price
          line.setPrice(orderPrice.toNumber());
        },
        onSettled: () => {
          line.setText(originalLabel); // revert inline feedback
        },
      });

      dispatchNotification({
        type: 'action_error_handler',
        data: {
          errorNotificationTitle: t(($) => $.errors.orderModificationFailed),
          executionData: { serverExecutionResult },
        },
      });
    }, MODIFY_DEBOUNCE_DELAY),
  );

  // Append Cancel action to the line
  line.onCancel(async () => {
    const { productId, digest, priceTriggerCriteria, orderDisplayType } =
      relevantOrder;
    const decimalAdjustedAmount = removeDecimals(relevantOrder.totalAmount);

    const originalLabel = line.getText();
    line.setText(`${t(($) => $.notifications.cancelling)}`); // inline feedback

    const result = cancelOrdersWithNotification({
      orders: [
        {
          isTrigger: !!priceTriggerCriteria,
          orderDisplayType,
          decimalAdjustedTotalAmount: decimalAdjustedAmount,
          productId,
          digest,
        },
      ],
    });

    const [, error] = await asyncResult(result);
    // Revert inline feedback only when there is an error. If the order is successfully cancelled, the line will be removed in a separate event.
    if (error) {
      line.setText(originalLabel);
    }
  });
}
