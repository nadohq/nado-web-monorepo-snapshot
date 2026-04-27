import { BigNumber } from 'bignumber.js';
import { ClosePositionFormErrorType } from 'client/modules/trading/closePosition/types';
import { useTranslation } from 'react-i18next';

interface Params {
  amountInputError: ClosePositionFormErrorType | undefined;
  minAssetOrderSize: BigNumber | undefined;
  decimalAdjustedSizeIncrement: BigNumber | undefined;
}

export function useClosePositionAmountErrorTooltipContent({
  amountInputError,
  minAssetOrderSize,
  decimalAdjustedSizeIncrement: sizeIncrement,
}: Params) {
  const { t } = useTranslation();

  switch (amountInputError) {
    case 'invalid_amount_input':
      return t(($) => $.errors.invalidAmountInput);
    case 'invalid_size_increment':
      return t(($) => $.errors.invalidSizeIncrement, { sizeIncrement });
    case 'max_exceeded':
      return t(($) => $.errors.maxExceededClosePosition);
    case 'below_min':
      return t(($) => $.errors.belowMinAmount, {
        formattedMinValue: minAssetOrderSize,
      });
    default:
      return null;
  }
}
