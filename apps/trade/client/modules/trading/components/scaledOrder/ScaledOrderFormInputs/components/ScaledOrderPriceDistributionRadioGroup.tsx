import { ScaledOrderRadioGroup } from 'client/modules/trading/components/scaledOrder/ScaledOrderFormInputs/components/ScaledOrderRadioGroup';
import { OrderFormScaledOrderPriceDistributionType } from 'client/modules/trading/types/orderFormTypes';
import { useTranslation } from 'react-i18next';

interface Props {
  priceDistributionType: OrderFormScaledOrderPriceDistributionType;
  onPriceDistributionChange: (
    value: OrderFormScaledOrderPriceDistributionType,
  ) => void;
}

export function ScaledOrderPriceDistributionRadioGroup({
  priceDistributionType,
  onPriceDistributionChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <ScaledOrderRadioGroup.Root
      value={priceDistributionType}
      onValueChange={onPriceDistributionChange}
    >
      <ScaledOrderRadioGroup.Button
        dataTestId="order-form-scaled-order-price-distribution-flat-button"
        value={'flat' satisfies OrderFormScaledOrderPriceDistributionType}
        active={priceDistributionType === 'flat'}
      >
        {t(($) => $.scaledOrders.flat)}
      </ScaledOrderRadioGroup.Button>
      <ScaledOrderRadioGroup.Button
        dataTestId="order-form-scaled-order-price-distribution-increasing-button"
        value={'increasing' satisfies OrderFormScaledOrderPriceDistributionType}
        active={priceDistributionType === 'increasing'}
      >
        {t(($) => $.scaledOrders.increasing)}
      </ScaledOrderRadioGroup.Button>
      <ScaledOrderRadioGroup.Button
        dataTestId="order-form-scaled-order-price-distribution-decreasing-button"
        value={'decreasing' satisfies OrderFormScaledOrderPriceDistributionType}
        active={priceDistributionType === 'decreasing'}
      >
        {t(($) => $.scaledOrders.decreasing)}
      </ScaledOrderRadioGroup.Button>
    </ScaledOrderRadioGroup.Root>
  );
}
