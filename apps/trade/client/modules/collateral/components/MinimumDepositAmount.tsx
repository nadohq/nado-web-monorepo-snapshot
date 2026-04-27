import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { Icons } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useTranslation } from 'react-i18next';

interface Props {
  amount: BigNumber | undefined;
  symbol: string | undefined;
  isInitial: boolean;
}

export function MinimumDepositAmount({ amount, symbol, isInitial }: Props) {
  const { t } = useTranslation();

  if (!amount || !symbol) {
    return null;
  }

  return (
    <ValueWithLabel.Horizontal
      fitWidth
      sizeVariant="xs"
      labelStartIcon={Icons.CurrencyCircleDollar}
      label={t(($) => (isInitial ? $.minimumInitialDeposit : $.minimumDeposit))}
      labelClassName="label-separator"
      value={amount}
      numberFormatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
      valueEndElement={symbol}
    />
  );
}
