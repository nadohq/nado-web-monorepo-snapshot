import { TriggerOrderInfo } from '@nadohq/client';
import { TriggerOrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';
import { getIsTriggerPriceAbove } from 'client/modules/trading/utils/trigger/getIsTriggerPriceAbove';
import { requirePriceTriggerCriteria } from 'client/modules/trading/utils/trigger/getPriceTriggerCriteria';

export function getTriggerOrderDisplayType(
  order: TriggerOrderInfo,
): TriggerOrderDisplayType {
  const orderAppendix = order.order.appendix;
  const triggerCriteria = order.order.triggerCriteria;

  if (triggerCriteria.type === 'time') {
    return 'twap';
  }

  const priceTriggerCriteria = requirePriceTriggerCriteria(triggerCriteria);
  if (orderAppendix.reduceOnly) {
    const isTriggerPriceAbove = getIsTriggerPriceAbove(
      priceTriggerCriteria.type,
    );
    // Reduce only order has reverse amount sign from position.
    const isLongPosition = order.order.amount.isNegative();

    // If current position > 0 (Long) has (Short) criteria price above. It's a take profit order.
    // If current position > 0 (Long) has (Short) criteria price bellow. It's a stop loss order.
    if (isLongPosition) {
      return isTriggerPriceAbove ? 'take_profit' : 'stop_loss';
    }

    // If current position < 0 (Short): has (Long) criteria price above. It's a stop loss order.
    // If current position < 0 (Short): has (Long) criteria price bellow. It's a take profit order.
    return isTriggerPriceAbove ? 'stop_loss' : 'take_profit';
  }

  // Use orderExecutionType to differentiate between stop limit / market
  // Default orderExecutionType is stop limit, IOC is stop market
  return orderAppendix.orderExecutionType === 'default'
    ? 'stop_limit'
    : 'stop_market';
}
