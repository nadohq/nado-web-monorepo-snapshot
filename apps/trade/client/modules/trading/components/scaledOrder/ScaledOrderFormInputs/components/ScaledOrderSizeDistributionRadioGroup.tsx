import { ScaledOrderRadioGroup } from 'client/modules/trading/components/scaledOrder/ScaledOrderFormInputs/components/ScaledOrderRadioGroup';
import { OrderFormScaledOrderSizeDistributionType } from 'client/modules/trading/types/orderFormTypes';
import { useTranslation } from 'react-i18next';

interface Props {
  sizeDistributionType: OrderFormScaledOrderSizeDistributionType;
  onSizeDistributionChange: (
    value: OrderFormScaledOrderSizeDistributionType,
  ) => void;
}

export function ScaledOrderSizeDistributionRadioGroup({
  sizeDistributionType,
  onSizeDistributionChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <ScaledOrderRadioGroup.Root
      value={sizeDistributionType}
      onValueChange={onSizeDistributionChange}
    >
      <ScaledOrderRadioGroup.Button
        dataTestId="order-form-scaled-order-size-distribution-evenly-split-button"
        value={
          'evenly_split' satisfies OrderFormScaledOrderSizeDistributionType
        }
        active={sizeDistributionType === 'evenly_split'}
      >
        {t(($) => $.scaledOrders.evenlySplit)}
      </ScaledOrderRadioGroup.Button>
      <ScaledOrderRadioGroup.Button
        dataTestId="order-form-scaled-order-size-distribution-increasing-button"
        value={'increasing' satisfies OrderFormScaledOrderSizeDistributionType}
        active={sizeDistributionType === 'increasing'}
      >
        {t(($) => $.scaledOrders.increasing)}
      </ScaledOrderRadioGroup.Button>
      <ScaledOrderRadioGroup.Button
        dataTestId="order-form-scaled-order-size-distribution-decreasing-button"
        value={'decreasing' satisfies OrderFormScaledOrderSizeDistributionType}
        active={sizeDistributionType === 'decreasing'}
      >
        {t(($) => $.scaledOrders.decreasing)}
      </ScaledOrderRadioGroup.Button>
    </ScaledOrderRadioGroup.Root>
  );
}
