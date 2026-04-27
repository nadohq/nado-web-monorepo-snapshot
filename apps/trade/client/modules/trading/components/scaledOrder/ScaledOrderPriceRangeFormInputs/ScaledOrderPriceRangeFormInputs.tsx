import { BigNumber } from 'bignumber.js';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { useScaledOrderEndPriceErrorTooltipContent } from 'client/modules/trading/components/scaledOrder/ScaledOrderPriceRangeFormInputs/hooks/useScaledOrderEndPriceErrorTooltipContent';
import { useScaledOrderStartPriceErrorTooltipContent } from 'client/modules/trading/components/scaledOrder/ScaledOrderPriceRangeFormInputs/hooks/useScaledOrderStartPriceErrorTooltipContent';
import {
  OrderFormError,
  OrderFormValidators,
  OrderFormValues,
  SetActiveFieldFn,
} from 'client/modules/trading/types/orderFormTypes';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  validators: OrderFormValidators;
  priceIncrement: BigNumber | undefined;
  formError: OrderFormError | undefined;
  setActiveField: SetActiveFieldFn;
}

export function ScaledOrderPriceRangeFormInputs({
  validators,
  priceIncrement,
  formError,
  setActiveField,
}: Props) {
  const { t } = useTranslation();

  const form = useFormContext<OrderFormValues>();

  const scaledOrderStartPriceErrorTooltipContent =
    useScaledOrderStartPriceErrorTooltipContent({
      formError,
      priceIncrement,
    });

  const scaledOrderEndPriceErrorTooltipContent =
    useScaledOrderEndPriceErrorTooltipContent({
      formError,
      priceIncrement,
    });

  const pricePlaceholder = useNumericInputPlaceholder({
    increment: priceIncrement,
  });

  return (
    <div className="grid grid-cols-2 gap-x-2">
      <NumberInputWithLabel
        dataTestId="scaled-order-form-start-price-input"
        {...form.register('scaledOrder.startPrice', {
          validate: validators.scaledOrderStartPrice,
        })}
        onFocus={() => setActiveField('scaledOrder.startPrice')}
        label={t(($) => $.startPrice)}
        placeholder={pricePlaceholder}
        step={priceIncrement?.toString()}
        errorTooltipContent={scaledOrderStartPriceErrorTooltipContent}
      />
      <NumberInputWithLabel
        dataTestId="scaled-order-form-end-price-input"
        {...form.register('scaledOrder.endPrice', {
          validate: validators.scaledOrderEndPrice,
        })}
        onFocus={() => setActiveField('scaledOrder.endPrice')}
        label={t(($) => $.endPrice)}
        placeholder={pricePlaceholder}
        step={priceIncrement?.toString()}
        errorTooltipContent={scaledOrderEndPriceErrorTooltipContent}
      />
    </div>
  );
}
