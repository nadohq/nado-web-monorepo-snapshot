import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useTranslation } from 'react-i18next';

interface Props {
  estimatedValueUsd: BigNumber | undefined;
}

export function EstimatedCurrencyValueItem({ estimatedValueUsd }: Props) {
  const { t } = useTranslation();

  if (!estimatedValueUsd) {
    return null;
  }

  const currencyValue = formatNumber(estimatedValueUsd, {
    formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
  });

  return t(($) => $.estimatedCurrencyValue, { currencyValue });
}
