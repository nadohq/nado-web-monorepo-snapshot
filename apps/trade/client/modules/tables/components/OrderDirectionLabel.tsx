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

  const orderSideColor =
    orderSide === 'long' ? 'text-positive' : 'text-negative';

  const orderDirectionLabel = getOrderDirectionLabel({
    t,
    productType,
    orderSide,
    isReduceOnly,
    isReversal,
  });

  return <span className={orderSideColor}>{orderDirectionLabel}</span>;
}
