import { formatNumber } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { StackedValues } from 'client/modules/tables/components/StackedValues';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  filledAvgPrice: BigNumber | undefined;
  orderPrice: BigNumber;
  isMarket: boolean;
  formatSpecifier: string;
}

export function OrderFilledPrice({
  className,
  filledAvgPrice,
  orderPrice,
  isMarket,
  formatSpecifier,
}: Props) {
  const { t } = useTranslation();

  const formattedFilledAvgPrice = formatNumber(filledAvgPrice, {
    formatSpecifier,
  });
  const orderPriceText = isMarket
    ? t(($) => $.market)
    : formatNumber(orderPrice, { formatSpecifier });

  return (
    <StackedValues
      className={className}
      withSeparator
      top={formattedFilledAvgPrice}
      bottom={orderPriceText}
    />
  );
}
