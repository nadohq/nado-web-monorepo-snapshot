import { formatNumber } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import { StackedValues } from 'client/modules/tables/components/StackedValues';
import { useTranslation } from 'react-i18next';

interface Props {
  filledBaseSize: BigNumber | undefined;
  totalBaseSize: BigNumber;
  baseSymbol: string;
  formatSpecifier: string;
  isCloseEntirePosition: boolean;
}

export function OrderFilledTotal({
  filledBaseSize,
  totalBaseSize,
  baseSymbol,
  formatSpecifier,
  isCloseEntirePosition,
}: Props) {
  const { t } = useTranslation();

  return (
    <StackedValues
      withSeparator
      top={formatNumber(filledBaseSize, {
        formatSpecifier,
      })}
      bottom={
        isCloseEntirePosition ? (
          t(($) => $.entirePosition)
        ) : (
          <AmountWithSymbol
            formattedAmount={formatNumber(totalBaseSize, {
              formatSpecifier,
            })}
            symbol={baseSymbol}
          />
        )
      }
    />
  );
}
