import { TriggerReferencePriceType } from 'client/modules/trading/types/TriggerReferencePriceType';
import type { TFunction } from 'i18next';

export function getTriggerReferencePriceTypeLabel(
  t: TFunction,
  referencePriceType: TriggerReferencePriceType,
): string {
  switch (referencePriceType) {
    case 'last_price':
      return t(($) => $.lastPrice);
    case 'oracle_price':
      return t(($) => $.oraclePrice);
    case 'mid_price':
      return t(($) => $.midPrice);
  }
}
