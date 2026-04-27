import { SecondaryButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { OrderFormInputsSection } from 'client/modules/trading/components/OrderFormInputsSection';
import { ScaledOrderPriceDistributionRadioGroup } from 'client/modules/trading/components/scaledOrder/ScaledOrderFormInputs/components/ScaledOrderPriceDistributionRadioGroup';
import { ScaledOrderSizeDistributionRadioGroup } from 'client/modules/trading/components/scaledOrder/ScaledOrderFormInputs/components/ScaledOrderSizeDistributionRadioGroup';
import { useScaledOrderFormInputs } from 'client/modules/trading/components/scaledOrder/ScaledOrderFormInputs/hooks/useScaledOrderFormInputs';
import {
  OrderFormError,
  OrderFormValidators,
  RoundAmountFn,
  RoundPriceFn,
} from 'client/modules/trading/types/orderFormTypes';
import { useTranslation } from 'react-i18next';

interface Props {
  validators: OrderFormValidators;
  formError: OrderFormError | undefined;
  productId: number | undefined;
  roundPrice: RoundPriceFn;
  roundAssetAmount: RoundAmountFn;
  validAssetAmount: BigNumber | undefined;
}

const ORDER_QUANTITY_PRESETS = [5, 10, 20, 30, 50] as const;

export function ScaledOrderFormInputs({
  validators,
  formError,
  productId,
  roundPrice,
  roundAssetAmount,
  validAssetAmount,
}: Props) {
  const { t } = useTranslation();

  const {
    numberOfOrdersInputRegister,
    numberOfOrdersErrorTooltipContent,
    priceDistributionType,
    sizeDistributionType,
    handlePriceDistributionChange,
    handleSizeDistributionChange,
    handleOrderQuantityPresetClick,
    handlePreviewOrders,
    isPreviewOrdersButtonDisabled,
  } = useScaledOrderFormInputs({
    validators,
    formError,
    productId,
    roundPrice,
    roundAssetAmount,
    validAssetAmount,
  });

  const quantityPlaceholder = useNumericInputPlaceholder();

  return (
    <div className="flex flex-col gap-y-4">
      {/* Order Quantity Section */}
      <OrderFormInputsSection>
        <NumberInputWithLabel
          dataTestId="scaled-order-form-quantity-input"
          label={t(($) => $.quantity)}
          placeholder={quantityPlaceholder}
          errorTooltipContent={numberOfOrdersErrorTooltipContent}
          {...numberOfOrdersInputRegister}
        />
        {/* Quick Select Buttons */}
        <div className="flex gap-x-2">
          {ORDER_QUANTITY_PRESETS.map((preset) => (
            <SecondaryButton
              size="xs"
              className="flex-1"
              key={preset}
              onClick={() => handleOrderQuantityPresetClick(preset)}
              dataTestId={`scaled-order-form-quantity-preset-${preset}-button`}
            >
              {preset}
            </SecondaryButton>
          ))}
        </div>
      </OrderFormInputsSection>
      {/* Price Distribution */}
      <OrderFormInputsSection label={t(($) => $.priceDistribution)}>
        <ScaledOrderPriceDistributionRadioGroup
          priceDistributionType={priceDistributionType}
          onPriceDistributionChange={handlePriceDistributionChange}
        />
      </OrderFormInputsSection>
      {/* Size Distribution */}
      <OrderFormInputsSection label={t(($) => $.sizeDistribution)}>
        <ScaledOrderSizeDistributionRadioGroup
          sizeDistributionType={sizeDistributionType}
          onSizeDistributionChange={handleSizeDistributionChange}
        />
      </OrderFormInputsSection>
      {/* Preview Orders Button */}
      <SecondaryButton
        disabled={isPreviewOrdersButtonDisabled}
        size="xs"
        onClick={handlePreviewOrders}
        dataTestId="scaled-order-form-preview-orders-button"
      >
        {t(($) => $.buttons.previewOrders)}
      </SecondaryButton>
    </div>
  );
}
