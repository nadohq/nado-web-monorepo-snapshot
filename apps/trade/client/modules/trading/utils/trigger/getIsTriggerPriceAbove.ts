import { PriceTriggerRequirementType } from '@nadohq/client';

export function getIsTriggerPriceAbove(
  priceRequirementType: PriceTriggerRequirementType,
): boolean {
  switch (priceRequirementType) {
    case 'last_price_above':
    case 'oracle_price_above':
    case 'mid_price_above':
      return true;
    case 'oracle_price_below':
    case 'last_price_below':
    case 'mid_price_below':
      return false;
  }
}
