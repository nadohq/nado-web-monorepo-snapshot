import { TimeInSeconds } from '@nadohq/client';

/**
 * The default frequency presets for TWAP orders.
 */
export const TWAP_FREQUENCY_PRESETS = {
  '30s': 0.5 * TimeInSeconds.MINUTE,
  '1m': TimeInSeconds.MINUTE,
  '2m': 2 * TimeInSeconds.MINUTE,
  '5m': 5 * TimeInSeconds.MINUTE,
} as const;

/**
 * The default randomness fraction for TWAP orders.
 */
export const TWAP_RANDOMNESS_FRACTION = 0.2;
