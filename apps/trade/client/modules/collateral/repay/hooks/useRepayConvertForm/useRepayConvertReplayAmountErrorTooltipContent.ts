import { WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { RepayConvertAmountInputErrorType } from 'client/modules/collateral/repay/hooks/useRepayConvertForm/types';
import { useTranslation } from 'react-i18next';

interface Params extends WithClassnames {
  amountInputError: RepayConvertAmountInputErrorType | undefined;
  sizeIncrement: BigNumber | undefined;
}

export function useRepayConvertReplayAmountErrorTooltipContent({
  amountInputError,
  sizeIncrement,
}: Params) {
  const { t } = useTranslation();

  if (!amountInputError) {
    return null;
  }

  return {
    max_exceeded: t(($) => $.errors.repayConvertMaxExceeded),
    invalid_input: t(($) => $.errors.invalidAmountInput),
    invalid_size_increment: t(($) => $.errors.invalidSizeIncrement, {
      sizeIncrement,
    }),
  }[amountInputError];
}
