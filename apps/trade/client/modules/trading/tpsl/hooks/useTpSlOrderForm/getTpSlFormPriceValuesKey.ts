/**
 * Returns the key that maps to the take profit or stop loss price values in TpSlOrderFormValues.
 */
export function getTpSlFormPriceValuesKey(isTakeProfit: boolean) {
  return isTakeProfit ? 'tp' : 'sl';
}
