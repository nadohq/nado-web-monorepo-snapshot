import { ProductEngineType } from '@nadohq/client';
import { getOrderDirectionLabel } from 'client/modules/trading/utils/getOrderDirectionLabel';
import { useTranslation } from 'react-i18next';

type Props = Omit<Parameters<typeof getOrderDirectionLabel>[0], 't'>;

export function OrderDirectionLabel({
  productType,
  orderSide,
  isReduceOnly,
  isReversal,
}: Props) {
  const { t } = useTranslation();

  // Color reflects the position direction described by the label rather than
  // the order's action side — e.g. a perp reduce-only short closes a long
  // position, so "Close Long" renders as positive (green).
  const isPositionLong = (() => {
    const isPerp = productType === ProductEngineType.PERP;
    if (isReduceOnly && isPerp) {
      return orderSide === 'short';
    }
    return orderSide === 'long';
  })();
  const orderSideColor = isPositionLong ? 'text-positive' : 'text-negative';

  const orderDirectionLabel = getOrderDirectionLabel({
    t,
    productType,
    orderSide,
    isReduceOnly,
    isReversal,
  });

  return <span className={orderSideColor}>{orderDirectionLabel}</span>;
}
