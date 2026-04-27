import { BigNumberish, toBigNumber } from '@nadohq/client';

const DEFAULT_DECIMALS = 2;
const DEFAULT_PLACEHOLDER = (0).toFixed(DEFAULT_DECIMALS); // i.e. 0.00

type UseNumericInputPlaceholderParams =
  | {
      increment: BigNumberish | undefined;
    }
  | {
      decimals: BigNumberish;
    };

/**
 * Returns a numeric input placeholder string (e.g. "0.00") based on either a market
 * increment or an explicit decimal precision.
 *
 * Default is "0.00" when no `increment` or `decimals` provided.
 */
export function useNumericInputPlaceholder(
  params?: UseNumericInputPlaceholderParams,
) {
  if (!params) {
    return DEFAULT_PLACEHOLDER;
  }

  const decimals = (() => {
    if ('increment' in params && params.increment !== undefined) {
      return toBigNumber(params.increment).decimalPlaces();
    }
    if ('decimals' in params) {
      return toBigNumber(params.decimals).integerValue().toNumber();
    }
  })();

  return (0).toFixed(decimals ?? DEFAULT_DECIMALS);
}
