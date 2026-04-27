import {
  CustomNumberFormatSpecifier,
  formatNumber,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { CctpBridgeErrorType } from 'client/modules/collateral/deposit/CctpBridgeDialog/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  formError: CctpBridgeErrorType | undefined;
  minDepositAmount: BigNumber;
}

/**
 * Returns error tooltip content for CCTP bridge amount input based on form error type.
 */
export function useCctpBridgeAmountErrorTooltipContent({
  formError,
  minDepositAmount,
}: Params) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'invalid_input':
        return t(($) => $.errors.invalidAmountInput);
      case 'max_exceeded':
        return t(($) => $.errors.maxExceeded);
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
