import { ProductEngineType } from '@nadohq/client';
import { getOrderSideLabel } from 'client/modules/trading/utils/getOrderSideLabel';
import type { TFunction } from 'i18next';

interface Params {
  t: TFunction;
  productType: ProductEngineType;
  orderSide: string;
  isReduceOnly: boolean;

  /**
   * Whether the historical order reversed a position (L->S or S->L)
   * This attribute only makes sense for historical order/trade, leave undefined for open orders.
   */
  isReversal?: boolean;
}

export function getOrderDirectionLabel({
  t,
  productType,
  orderSide,
  isReduceOnly,
  isReversal,
}: Params): string {
  const isPerp = productType === ProductEngineType.PERP;

  const isLong = (() => {
    // For perp reduce only, the order side is reversed (eg. Reduce 'Long' -> 'Close Short'), so we need to reverse the logic here
    if (isReduceOnly && isPerp) {
      return orderSide === 'short';
    }
    return orderSide === 'long';
  })();
  const orderSideLabel = getOrderSideLabel({
    t,
    isPerp,
    isLong,
    alwaysShowOrderDirection: false,
  });

  if (!isPerp) {
    return orderSideLabel;
  }

  if (isReversal && isReduceOnly) {
    // this should never happen, but we handle it gracefully
    return orderSideLabel;
  }

  if (isReversal) {
    switch (orderSide) {
      case 'long':
        return t(($) => $.reversalShortToLong);
      case 'short':
        return t(($) => $.reversalLongToShort);
    }
  }

  return isReduceOnly
    ? t(($) => $.closeDirectionSide, { side: orderSideLabel })
    : orderSideLabel;
}
