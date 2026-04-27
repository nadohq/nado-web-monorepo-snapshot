import {
  CustomNumberFormatSpecifier,
  formatNumber,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { Usdt0BridgeErrorType } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  formError: Usdt0BridgeErrorType | undefined;
  minDepositAmount: BigNumber | undefined;
}

export function useUsdt0BridgeAmountErrorTooltipContent({
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
      case 'max_exceeded':
        return t(($) => $.errors.maxExceeded);
      default:
        return null;
    }
  }, [formError, minDepositAmount, t]);
}
