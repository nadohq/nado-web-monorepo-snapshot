import { PriceTriggerCriteria } from '@nadohq/client';
import { TriggerReferencePriceType } from 'client/modules/trading/types/TriggerReferencePriceType';

export function getTriggerReferencePriceType(
  triggerCriteria: PriceTriggerCriteria,
): TriggerReferencePriceType {
  switch (triggerCriteria.type) {
    case 'last_price_below':
    case 'last_price_above':
      return 'last_price';
    case 'oracle_price_below':
    case 'oracle_price_above':
      return 'oracle_price';
    case 'mid_price_below':
    case 'mid_price_above':
      return 'mid_price';
  }
}
