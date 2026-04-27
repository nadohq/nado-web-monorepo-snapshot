import { formatNumber } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useTranslation } from 'react-i18next';

interface Props {
  isMarket: boolean;
  orderPrice: BigNumber;
  formatSpecifier: string;
}

export function OrderPrice({ isMarket, orderPrice, formatSpecifier }: Props) {
  const { t } = useTranslation();

  if (isMarket) {
    return t(($) => $.market);
  }

  return formatNumber(orderPrice, { formatSpecifier });
}
