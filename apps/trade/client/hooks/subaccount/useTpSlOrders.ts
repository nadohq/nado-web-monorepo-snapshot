import { TriggerOrderInfo } from '@nadohq/client';
import { useQuerySubaccountOpenTriggerOrders } from 'client/hooks/query/subaccount/useQuerySubaccountOpenTriggerOrders';
import { getIsIsoTriggerOrder } from 'client/modules/trading/utils/isoOrderChecks';
import { getTriggerOrderDisplayType } from 'client/modules/trading/utils/trigger/getTriggerOrderDisplayType';
import { useMemo } from 'react';

interface TpSlOrders {
  /**
   * The primary set of TPSL orders for a position. Given multiple orders, this will be the one with the largest size
   */
  tp: TriggerOrderInfo | undefined;
  sl: TriggerOrderInfo | undefined;
  /**
   * All TPSL orders that may exist for the same position, includes `tp` and `sl` above
   */
  all: TriggerOrderInfo[];
  allTp: TriggerOrderInfo[];
  allSl: TriggerOrderInfo[];
}

interface TpSlOrdersForProduct {
  iso: TpSlOrders;
  cross: TpSlOrders;
}

/**
 * Returns TPSL orders for the current subaccount by product ID
 * TPSLs are reduce-only price-triggered orders
 */
export function useTpSlOrders() {
  const { data: openTriggerOrders, ...rest } =
    useQuerySubaccountOpenTriggerOrders();

  const mappedReduceOnlyOrders = useMemo(() => {
    if (!openTriggerOrders) {
      return;
    }

    const reduceOrdersByProductId: Record<
      number,
      TpSlOrdersForProduct | undefined
    > = {};

    Object.entries(openTriggerOrders).forEach(([productId, openOrders]) => {
      const isoTpSlOrders: TpSlOrders = {
        tp: undefined,
        sl: undefined,
        all: [],
        allTp: [],
        allSl: [],
      };
      const crossTpSlOrders: TpSlOrders = {
        tp: undefined,
        sl: undefined,
        all: [],
        allTp: [],
        allSl: [],
      };

      openOrders.forEach((order) => {
        const orderDisplayType = getTriggerOrderDisplayType(order);
        const isIso = getIsIsoTriggerOrder(order);
        const tpSlOrders = isIso ? isoTpSlOrders : crossTpSlOrders;

        if (orderDisplayType === 'stop_market') {
          return;
        } else if (orderDisplayType === 'take_profit') {
          const currentTp = tpSlOrders.tp;
          if (
            !currentTp ||
            order.order.amount.abs().gt(currentTp.order.amount.abs())
          ) {
            tpSlOrders.tp = order;
          }
          tpSlOrders.all.push(order);
          tpSlOrders.allTp.push(order);
        } else if (orderDisplayType === 'stop_loss') {
          const currentSl = tpSlOrders.sl;
          if (
            !currentSl ||
            order.order.amount.abs().gt(currentSl.order.amount.abs())
          ) {
            tpSlOrders.sl = order;
          }
          tpSlOrders.all.push(order);
          tpSlOrders.allSl.push(order);
        }
      });

      reduceOrdersByProductId[Number(productId)] = {
        iso: isoTpSlOrders,
        cross: crossTpSlOrders,
      };
    });

    return reduceOrdersByProductId;
  }, [openTriggerOrders]);

  return {
    data: mappedReduceOnlyOrders,
    ...rest,
  };
}
