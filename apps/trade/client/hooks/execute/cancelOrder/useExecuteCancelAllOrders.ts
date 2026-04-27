import { BalanceSide } from '@nadohq/client';
import { CancellableOrder } from 'client/hooks/execute/cancelOrder/types';
import { useExecuteCancelOrders } from 'client/hooks/execute/cancelOrder/useExecuteCancelOrders';
import { useFilteredProductIds } from 'client/hooks/markets/useFilteredProductIds';
import { useQuerySubaccountOpenEngineOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenEngineOrders';
import { useQuerySubaccountOpenTriggerOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenTriggerOrders';
import { useCanUserExecute } from 'client/hooks/subaccount/useCanUserExecute';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { OrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';
import { getTriggerOrderDisplayType } from 'client/modules/trading/utils/trigger/getTriggerOrderDisplayType';
import { useCallback, useMemo } from 'react';

export interface CancelAllOrdersFilter {
  /**
   * If provided, only orders for these product IDs will be cancelled
   */
  productIds?: number[];
  /**
   * If provided, only orders of these display types will be cancelled
   */
  orderDisplayTypes?: OrderDisplayType[];
  /**
   * If true, only isolated orders will be cancelled. If false, only cross orders will be cancelled.
   * If undefined, both isolated and cross orders will be cancelled
   */
  iso?: boolean;
}

export function useExecuteCancelAllOrders({
  productIds,
  orderDisplayTypes,
  iso,
}: CancelAllOrdersFilter) {
  const {
    mutateAsync: cancelOrders,
    reset: resetExecuteCancelAllOrders,
    status,
  } = useExecuteCancelOrders();
  const { dispatchNotification } = useNotificationManagerContext();
  const {
    allOrders,
    longOrders,
    shortOrders,
    numOrders,
    numLongOrders,
    numShortOrders,
  } = useOrdersToCancel({
    productIds,
    orderDisplayTypes,
    iso,
  });

  const canUserExecute = useCanUserExecute();

  const createCancelHandler = useCallback(
    (orders: CancellableOrder[]) => {
      return () => {
        if (orders?.length) {
          const serverExecutionResult = cancelOrders({
            orders: orders.map((order) => {
              return {
                isTrigger: order.isTrigger,
                productId: order.productId,
                digest: order.digest,
              };
            }),
          });

          dispatchNotification({
            type: 'cancel_multi_orders',
            data: {
              serverExecutionResult,
              numOrders: orders.length,
            },
          });
        }
      };
    },
    [cancelOrders, dispatchNotification],
  );

  useRunWithDelayOnCondition({
    condition: status === 'success',
    fn: resetExecuteCancelAllOrders,
    delay: RUN_WITH_DELAY_DURATIONS.SHORT,
  });

  const canExecute = status !== 'pending' && canUserExecute;

  return {
    cancelAllOrders: createCancelHandler(allOrders),
    cancelLongOrders: createCancelHandler(longOrders),
    cancelShortOrders: createCancelHandler(shortOrders),
    numOrders,
    numLongOrders,
    numShortOrders,
    canCancelAll: canExecute && !!numOrders,
    canCancelLong: canExecute && !!numLongOrders,
    canCancelShort: canExecute && !!numShortOrders,
    status,
  };
}

function useOrdersToCancel({
  productIds,
  orderDisplayTypes,
  iso,
}: CancelAllOrdersFilter) {
  const { filteredProductIds } = useFilteredProductIds({ productIds });
  const { data: engineOrdersData } = useQuerySubaccountOpenEngineOrders();
  const { data: triggerOrdersData } = useQuerySubaccountOpenTriggerOrders();

  return useMemo(() => {
    const longOrders: CancellableOrder[] = [];
    const shortOrders: CancellableOrder[] = [];

    if (!filteredProductIds.length) {
      return {
        allOrders: [],
        longOrders: [],
        shortOrders: [],
        numOrders: 0,
        numLongOrders: 0,
        numShortOrders: 0,
      };
    }

    filteredProductIds.forEach((productId) => {
      // Handle engine orders
      engineOrdersData?.[productId]?.forEach(
        ({ productId, digest, appendix, totalAmount }) => {
          // All on-book engine orders are limit orders
          if (orderDisplayTypes && !orderDisplayTypes.includes('limit')) {
            return;
          }
          if (iso !== undefined && !!appendix.isolated !== iso) {
            return;
          }

          const orderSide: BalanceSide = totalAmount.isPositive()
            ? 'long'
            : 'short';

          const order: CancellableOrder = {
            productId,
            digest,
            isTrigger: false,
          };

          if (orderSide === 'long') {
            longOrders.push(order);
          } else {
            shortOrders.push(order);
          }
        },
      );

      // Handle trigger orders
      triggerOrdersData?.[productId]?.forEach((triggerOrder) => {
        if (
          orderDisplayTypes &&
          !orderDisplayTypes.includes(getTriggerOrderDisplayType(triggerOrder))
        ) {
          return;
        }
        if (
          iso !== undefined &&
          !!triggerOrder.order.appendix.isolated !== iso
        ) {
          return;
        }

        const orderSide: BalanceSide = triggerOrder.order.amount.isPositive()
          ? 'long'
          : 'short';

        const order: CancellableOrder = {
          productId: triggerOrder.order.productId,
          digest: triggerOrder.order.digest,
          isTrigger: true,
        };

        if (orderSide === 'long') {
          longOrders.push(order);
        } else {
          shortOrders.push(order);
        }
      });
    });

    return {
      allOrders: [...longOrders, ...shortOrders],
      longOrders,
      shortOrders,
      numOrders: longOrders.length + shortOrders.length,
      numLongOrders: longOrders.length,
      numShortOrders: shortOrders.length,
    };
  }, [
    filteredProductIds,
    engineOrdersData,
    triggerOrdersData,
    orderDisplayTypes,
    iso,
  ]);
}
