import { EngineOrder, TriggerOrderInfo } from '@nadohq/client';

export function getIsIsoEngineOrder(order: EngineOrder) {
  return !!order.appendix.isolated;
}

export function getIsIsoTriggerOrder(orderInfo: TriggerOrderInfo) {
  return !!orderInfo.order.appendix.isolated;
}
