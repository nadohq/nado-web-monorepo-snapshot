import { TimeTriggerCriteria, TriggerCriteria } from '@nadohq/client';

/**
 * Returns the time trigger criteria from the given trigger criteria.
 * If the trigger criteria is not a time trigger, it returns undefined
 *
 * @param triggerCriteria
 */
export function getTimeTriggerCriteria(
  triggerCriteria: TriggerCriteria,
): TimeTriggerCriteria | undefined {
  if (triggerCriteria.type === 'time') {
    return triggerCriteria.criteria;
  }
}

/**
 * Same as getTimeTriggerCriteria but throws if the criteria is not a time trigger
 */
export function requireTimeTriggerCriteria(
  triggerCriteria: TriggerCriteria,
): TimeTriggerCriteria {
  const timeTriggerCriteria = getTimeTriggerCriteria(triggerCriteria);
  if (!timeTriggerCriteria) {
    throw new Error(
      '[requireTimeTriggerCriteria] Trigger criteria is not a time trigger',
    );
  }
  return timeTriggerCriteria;
}
