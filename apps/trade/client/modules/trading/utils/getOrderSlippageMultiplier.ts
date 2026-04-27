/**
 * Get the slippage multiplier for a given order side and slippage fraction
 * @param isLong - Whether the order is long
 * @param slippageFraction - The slippage fraction
 * @returns The slippage multiplier
 */
export function getOrderSlippageMultiplier(
  isLong: boolean,
  slippageFraction: number,
) {
  return isLong ? 1 + slippageFraction : 1 - slippageFraction;
}
