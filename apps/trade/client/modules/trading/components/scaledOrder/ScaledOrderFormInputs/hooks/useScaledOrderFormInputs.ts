import { BigNumber } from 'bignumber.js';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useScaledOrderNumberOfOrdersErrorTooltipContent } from 'client/modules/trading/components/scaledOrder/ScaledOrderFormInputs/hooks/useScaledOrderNumberOfOrdersErrorTooltipContent';
import {
  OrderFormError,
  OrderFormScaledOrderPriceDistributionType,
  OrderFormScaledOrderSizeDistributionType,
  OrderFormValidators,
  OrderFormValues,
  RoundAmountFn,
  RoundPriceFn,
} from 'client/modules/trading/types/orderFormTypes';
import { buildScaledOrders } from 'client/modules/trading/utils/scaledOrderUtils';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

interface Params {
  validators: OrderFormValidators;
  formError: OrderFormError | undefined;
  productId: number | undefined;
  roundPrice: RoundPriceFn;
  roundAssetAmount: RoundAmountFn;
  validAssetAmount: BigNumber | undefined;
}

export function useScaledOrderFormInputs({
  validators,
  formError,
  productId,
  roundPrice,
  roundAssetAmount,
  validAssetAmount,
}: Params) {
  const form = useFormContext<OrderFormValues>();
  const [
    orderSide,
    priceDistributionType,
    sizeDistributionType,
    startPrice,
    endPrice,
    numberOfOrders,
  ] = useWatch({
    control: form.control,
    name: [
      'side',
      'scaledOrder.priceDistributionType',
      'scaledOrder.sizeDistributionType',
      'scaledOrder.startPrice',
      'scaledOrder.endPrice',
      'scaledOrder.numberOfOrders',
    ],
  });

  const numberOfOrdersErrorTooltipContent =
    useScaledOrderNumberOfOrdersErrorTooltipContent({
      formError,
    });

  const numberOfOrdersInputRegister = form.register(
    'scaledOrder.numberOfOrders',
    {
      validate: validators.scaledOrderNumberOfOrders,
    },
  );

  const handlePriceDistributionChange = useCallback(
    (value: OrderFormScaledOrderPriceDistributionType) => {
      form.setValue('scaledOrder.priceDistributionType', value);
    },
    [form],
  );

  const handleSizeDistributionChange = useCallback(
    (value: OrderFormScaledOrderSizeDistributionType) => {
      form.setValue('scaledOrder.sizeDistributionType', value);
    },
    [form],
  );

  const handleOrderQuantityPresetClick = useCallback(
    (preset: number) => {
      form.setValue('scaledOrder.numberOfOrders', preset.toString(), {
        shouldValidate: true,
        shouldTouch: true,
      });
    },
    [form],
  );

  const { show } = useDialog();

  const previewScaledOrders = useMemo(() => {
    return buildScaledOrders({
      // Convert valid asset amount to order asset amount (signed based on order side)
      orderAssetAmount: validAssetAmount?.times(orderSide === 'long' ? 1 : -1),
      startPrice,
      endPrice,
      numberOfOrders,
      priceDistributionType,
      sizeDistributionType,
      roundPrice,
      roundAssetAmount,
      // We don't need to calculate isolated margin for preview scaled orders.
      // So we set iso to undefined.
      iso: undefined,
    });
  }, [
    validAssetAmount,
    orderSide,
    startPrice,
    endPrice,
    numberOfOrders,
    priceDistributionType,
    sizeDistributionType,
    roundPrice,
    roundAssetAmount,
  ]);

  const isPreviewOrdersButtonDisabled = useMemo(() => {
    // Disable button if no scaled orders are generated
    return !previewScaledOrders?.length;
  }, [previewScaledOrders]);

  const handlePreviewOrders = useCallback(() => {
    if (!productId || !previewScaledOrders) {
      return;
    }

    show({
      type: 'preview_scaled_orders',
      params: {
        productId,
        previewScaledOrders,
      },
    });
  }, [previewScaledOrders, productId, show]);

  return {
    numberOfOrdersInputRegister,
    numberOfOrdersErrorTooltipContent,
    priceDistributionType,
    sizeDistributionType,
    handlePriceDistributionChange,
    handleSizeDistributionChange,
    handleOrderQuantityPresetClick,
    handlePreviewOrders,
    isPreviewOrdersButtonDisabled,
  };
}
