import { PriceTriggerCriteria, TriggerCriteria } from '@nadohq/client';

/**
 * Returns the price trigger criteria from the given trigger criteria.
 * If the trigger criteria is not a price trigger, it returns undefined
 *
 * @param triggerCriteria
 * @param throwOnInvalidType
 */
export function getPriceTriggerCriteria(
  triggerCriteria: TriggerCriteria,
): PriceTriggerCriteria | undefined {
  if (triggerCriteria.type === 'price') {
    return triggerCriteria.criteria;
  }
}

/**
 * Same as getPriceTriggerCriteria but throws if the criteria is not a price trigger
 */
export function requirePriceTriggerCriteria(
  triggerCriteria: TriggerCriteria,
): PriceTriggerCriteria {
  const priceTriggerCriteria = getPriceTriggerCriteria(triggerCriteria);
  if (!priceTriggerCriteria) {
    throw new Error(
      '[requirePriceTriggerCriteria] Trigger criteria is not a price trigger',
    );
  }

  return priceTriggerCriteria;
}
