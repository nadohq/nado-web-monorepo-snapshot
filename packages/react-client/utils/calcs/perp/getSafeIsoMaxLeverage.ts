/**
 * Isolated-margin max leverage with a 1x backoff from market max to match
 * isolated margin reservation and avoid max-leverage rounding/staleness
 * failures. Cross margin does not have this issue, so this util should not
 * be used there.
 */
export function getSafeIsoMaxLeverage(marketMaxLeverage: number): number {
  return Math.max(marketMaxLeverage - 1, 1);
}
