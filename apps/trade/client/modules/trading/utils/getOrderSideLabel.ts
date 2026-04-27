import { signDependentValue } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import type { TFunction } from 'i18next';

type SideProps =
  | {
      amountForSide: BigNumber;
      isLong?: never;
    }
  | { amountForSide?: never; isLong: boolean };

type Params = {
  t: TFunction;
  isPerp: boolean;
  alwaysShowOrderDirection: boolean;
} & SideProps;

/**
 * Get the relevant side label based on the input arguments;
 * @param isPerp - Either a perp or spot product
 * @param alwaysShowOrderDirection - Force return 'Buy/Long' or 'Sell/Short' for all perp products
 * @param amountForSide - Signed order amount used to determine the side label *
 * @param isLong - Boolean indicating if the order is a long or short
 * @returns 'Buy/Long' | 'Long' | 'Buy' | 'Sell/Short' | 'Short' | 'Sell' | '-'
 **/
export function getOrderSideLabel({
  t,
  isPerp,
  alwaysShowOrderDirection,
  amountForSide,
  isLong,
}: Params) {
  const longText = (() => {
    if (!isPerp) {
      return t(($) => $.buy);
    }
    if (alwaysShowOrderDirection) {
      return t(($) => $.buyLong);
    }
    return t(($) => $.long);
  })();
  const shortText = (() => {
    if (!isPerp) {
      return t(($) => $.sell);
    }
    if (alwaysShowOrderDirection) {
      return t(($) => $.sellShort);
    }
    return t(($) => $.short);
  })();

  if (amountForSide != null) {
    return signDependentValue(amountForSide, {
      positive: longText,
      negative: shortText,
      zero: '-',
    });
  }

  return isLong ? longText : shortText;
}
