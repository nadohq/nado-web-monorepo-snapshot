import { UserStateError } from 'client/hooks/subaccount/useUserStateError';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';
import {
  OrderFormError,
  OrderFormInputError,
  OrderFormValues,
} from 'client/modules/trading/types/orderFormTypes';
import {
  PRICE_TRIGGER_PLACE_ORDER_TYPES,
  TRIGGER_PLACE_ORDER_TYPES,
} from 'client/modules/trading/types/placeOrderTypes';
import { watchFormError } from 'client/utils/form/watchFormError';
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface Params {
  form: UseFormReturn<OrderFormValues>;
  userStateError: UserStateError | undefined;
}

export function useOrderFormError({
  form,
  userStateError,
}: Params): OrderFormError | undefined {
  const isSingleSignatureEnabled = useIsSingleSignatureSession();

  const [orderType, timeInForceType] = useWatch({
    control: form.control,
    name: ['orderType', 'orderSettings.timeInForceType'],
  });

  const sizeError: OrderFormInputError | undefined = watchFormError(
    form,
    'size',
  );
  const limitPriceInputError: OrderFormInputError | undefined = watchFormError(
    form,
    'limitPrice',
  );
  const triggerPriceInputError: OrderFormInputError | undefined =
    watchFormError(form, 'triggerPrice');

  const timeInForceInDaysInputError: OrderFormInputError | undefined =
    watchFormError(form, 'orderSettings.timeInForceInDays');

  // TWAP order errors
  const twapDurationHoursInputError: OrderFormInputError | undefined =
    watchFormError(form, 'twapOrder.durationHours');
  const twapDurationMinutesInputError: OrderFormInputError | undefined =
    watchFormError(form, 'twapOrder.durationMinutes');

  // Scaled order errors
  const scaledOrderStartPriceInputError: OrderFormInputError | undefined =
    watchFormError(form, 'scaledOrder.startPrice');
  const scaledOrderEndPriceInputError: OrderFormInputError | undefined =
    watchFormError(form, 'scaledOrder.endPrice');
  const scaledOrderNumberOfOrdersInputError: OrderFormInputError | undefined =
    watchFormError(form, 'scaledOrder.numberOfOrders');

  return useMemo((): OrderFormError | undefined => {
    const isPriceTriggerOrder =
      PRICE_TRIGGER_PLACE_ORDER_TYPES.includes(orderType);
    const isTriggerOrder = TRIGGER_PLACE_ORDER_TYPES.includes(orderType);

    const isTwapOrder = orderType === 'twap';
    const isLimitOrder = orderType === 'limit';
    const isScaledOrder = orderType === 'multi_limit';
    const isLimitOrScaledOrder = isLimitOrder || isScaledOrder;
    const isStopLimitOrder = orderType === 'stop_limit';
    const isLimitOrStopLimitOrder = isLimitOrder || isStopLimitOrder;
    const requiresOneClickTrading = isTriggerOrder || isScaledOrder;

    // Advanced orders (trigger and scaled) require single signature enabled
    // !userStateError to make sure we don't show it on disconnected, switch chain, etc... when interaction with single signature switch dialog is not possible elsewhere in the app.
    if (
      !userStateError &&
      !isSingleSignatureEnabled &&
      requiresOneClickTrading
    ) {
      return 'advanced_order_single_signature_disabled';
    }

    // Only validate on limit order and good_until is selected.
    if (
      isLimitOrScaledOrder &&
      timeInForceType === 'good_until' &&
      timeInForceInDaysInputError
    ) {
      return timeInForceInDaysInputError;
    }

    if (sizeError) {
      return sizeError;
    }

    // Validate trigger price for stop market and stop limit orders if needed
    if (isPriceTriggerOrder && triggerPriceInputError) {
      return triggerPriceInputError;
    }

    // Validate price for limit and stop_limit orders if needed
    if (isLimitOrStopLimitOrder && limitPriceInputError) {
      return limitPriceInputError;
    }

    // Validate TWAP order inputs if needed
    if (isTwapOrder) {
      if (twapDurationHoursInputError) {
        return twapDurationHoursInputError;
      }

      if (twapDurationMinutesInputError) {
        return twapDurationMinutesInputError;
      }
    }

    // Validate scaled order inputs if needed
    if (isScaledOrder) {
      if (scaledOrderStartPriceInputError) {
        return scaledOrderStartPriceInputError;
      }

      if (scaledOrderEndPriceInputError) {
        return scaledOrderEndPriceInputError;
      }

      if (scaledOrderNumberOfOrdersInputError) {
        return scaledOrderNumberOfOrdersInputError;
      }
    }
  }, [
    orderType,
    userStateError,
    isSingleSignatureEnabled,
    timeInForceType,
    timeInForceInDaysInputError,
    sizeError,
    triggerPriceInputError,
    limitPriceInputError,
    twapDurationHoursInputError,
    twapDurationMinutesInputError,
    scaledOrderStartPriceInputError,
    scaledOrderEndPriceInputError,
    scaledOrderNumberOfOrdersInputError,
  ]);
}
