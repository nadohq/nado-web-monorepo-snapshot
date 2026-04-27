import { removeDecimals } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { TPSL_MAX_ORDER_SIZE_WITH_DECIMALS } from 'client/modules/trading/tpsl/consts';
/**
 * Checks if the absolute value of the passed in amount is equal to the value
 * used for the size of TP/SL orders.
 */
export function isTpSlMaxOrderSize(
  decimalAdjustedAmount: BigNumber | undefined,
) {
  if (!decimalAdjustedAmount) {
    return false;
  }

  const decimalAdjustedTpSlOrderSize = removeDecimals(
    TPSL_MAX_ORDER_SIZE_WITH_DECIMALS,
  );
  // We need to check for "loose" comparison (<1% diff) because orders are rounded to the size increment. For example,
  // FIL-PERP has a size increment of 3, meaning that the rounded amount !== original placement amount
  const diff = decimalAdjustedAmount.abs().minus(decimalAdjustedTpSlOrderSize);
  return diff.div(decimalAdjustedTpSlOrderSize).abs().lt(0.01);
}
