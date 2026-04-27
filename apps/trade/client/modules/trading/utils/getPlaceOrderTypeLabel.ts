import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import type { TFunction } from 'i18next';

export function getPlaceOrderTypeLabel(
  t: TFunction,
  placeOrderType: PlaceOrderType,
): string {
  switch (placeOrderType) {
    case 'market':
      return t(($) => $.orderTypes.market);
    case 'limit':
      return t(($) => $.orderTypes.limit);
    case 'stop_market':
      return t(($) => $.orderTypes.stopMarket);
    case 'stop_limit':
      return t(($) => $.orderTypes.stopLimit);
    case 'twap':
      return t(($) => $.orderTypes.twap);
    case 'multi_limit':
      return t(($) => $.orderTypes.scaled);
  }
}
