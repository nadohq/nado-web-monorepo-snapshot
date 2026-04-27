import {
  CustomNumberFormatSpecifier,
  formatNumber,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { DepositErrorType } from 'client/modules/collateral/deposit/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  formError: DepositErrorType | undefined;
  minDepositAmount: BigNumber | undefined;
}

export function useDepositAmountErrorTooltipContent({
  formError,
  minDepositAmount,
}: Params) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'invalid_input':
        return t(($) => $.errors.invalidAmountInput);
      case 'below_min':
        return t(($) => $.errors.belowMinAmount, {
          formattedMinValue: formatNumber(minDepositAmount, {
            formatSpecifier: CustomNumberFormatSpecifier.NUMBER_PRECISE,
          }),
        });
      default:
        return null;
    }
  }, [formError, minDepositAmount, t]);
}
