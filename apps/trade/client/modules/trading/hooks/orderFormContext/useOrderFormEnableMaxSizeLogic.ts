import {
  PlaceOrderType,
  TRIGGER_PLACE_ORDER_TYPES,
} from 'client/modules/trading/types/placeOrderTypes';

interface Params {
  orderType: PlaceOrderType;
  reduceOnly: boolean;
}

export function useOrderFormEnableMaxSizeLogic({
  orderType,
  reduceOnly,
}: Params) {
  // Trigger orders have delayed execution, so max sizes don't mean much
  const isTriggerOrder = TRIGGER_PLACE_ORDER_TYPES.includes(orderType);

  // Deriving `disabled` is slightly easier to reason about
  const disabled =
    // Reduce-only orders can always exceed max order size to close a position
    reduceOnly || isTriggerOrder;

  return !disabled;
}
