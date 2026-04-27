import { OrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';
import type { TFunction } from 'i18next';

export function getOrderDisplayTypeLabel(
  t: TFunction,
  orderDisplayType: OrderDisplayType,
): string {
  switch (orderDisplayType) {
    case 'market':
      return t(($) => $.orderTypes.market);
    case 'limit':
      return t(($) => $.orderTypes.limit);
    case 'stop_market':
      return t(($) => $.orderTypes.stopMarket);
    case 'stop_limit':
      return t(($) => $.orderTypes.stopLimit);
    case 'stop_loss':
      return t(($) => $.orderTypes.stopLoss);
    case 'take_profit':
      return t(($) => $.orderTypes.takeProfit);
    case 'twap':
      return t(($) => $.orderTypes.twap);
  }
}
