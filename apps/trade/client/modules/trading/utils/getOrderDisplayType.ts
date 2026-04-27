import { OrderAppendix } from '@nadohq/client';
import { MARKET_ORDER_EXECUTION_TYPE } from 'client/modules/trading/consts/marketOrderExecutionType';
import { OrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';

export function getOrderDisplayType(appendix: OrderAppendix): OrderDisplayType {
  const isMarket = appendix.orderExecutionType === MARKET_ORDER_EXECUTION_TYPE;

  if (appendix.triggerType === 'price') {
    // Filled TP/SL reflect as "Stop Market" / "Stop Limit" orders because we don't have access to triggerCriteria type
    return isMarket ? 'stop_market' : 'stop_limit';
  }
  if (
    appendix.triggerType === 'twap' ||
    appendix.triggerType === 'twap_custom_amounts'
  ) {
    return 'twap';
  }
  return isMarket ? 'market' : 'limit';
}
