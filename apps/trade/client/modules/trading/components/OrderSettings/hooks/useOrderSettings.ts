import { CheckedState } from '@radix-ui/react-checkbox';
import {
  OrderFormValidators,
  OrderFormValues,
  TimeInForceType,
} from 'client/modules/trading/types/orderFormTypes';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { useFormContext, useWatch } from 'react-hook-form';

interface Params {
  validators: OrderFormValidators;
  orderType: PlaceOrderType;
}

/**
 * Hook that manages order settings based on order type configuration
 * @param params - Contains validators, price type for the order.
 * @returns Object containing form state, handlers, and visibility flags for order settings
 */
export function useOrderSettings({ orderType, validators }: Params) {
  const form = useFormContext<OrderFormValues>();

  const [
    timeInForceType,
    postOnlyChecked,
    reduceOnlyChecked,
    twapRandomOrderChecked,
  ] = useWatch({
    control: form.control,
    name: [
      'orderSettings.timeInForceType',
      'orderSettings.postOnly',
      'orderSettings.reduceOnly',
      'twapOrder.isRandomOrder',
    ],
  });

  const isLimitOrScaledOrder =
    orderType === 'limit' || orderType === 'multi_limit';
  const isTwapOrder = orderType === 'twap';

  const showTimeInForceSelect = isLimitOrScaledOrder;
  const showGoodUntilInput =
    timeInForceType === 'good_until' && isLimitOrScaledOrder;
  const showPostOnlyCheckbox =
    (timeInForceType === 'good_until' || timeInForceType === 'gtc') &&
    isLimitOrScaledOrder;

  const showTwapRandomOrderCheckbox = isTwapOrder;

  const setTimeInForceType = (value: TimeInForceType) =>
    form.setValue('orderSettings.timeInForceType', value);

  const onPostOnlyCheckedChange = (state: CheckedState) => {
    form.setValue('orderSettings.postOnly', !!state);
  };

  const onReduceOnlyCheckedChange = (state: CheckedState) => {
    form.setValue('orderSettings.reduceOnly', !!state);
  };

  const onTwapRandomOrderCheckedChange = (state: CheckedState) => {
    form.setValue('twapOrder.isRandomOrder', !!state);
  };

  const timeInForceRegister = form.register('orderSettings.timeInForceInDays', {
    validate: validators.timeInForceInDays,
  });

  return {
    timeInForceType,
    setTimeInForceType,
    postOnlyChecked,
    onPostOnlyCheckedChange,
    reduceOnlyChecked,
    onReduceOnlyCheckedChange,
    twapRandomOrderChecked,
    onTwapRandomOrderCheckedChange,
    timeInForceRegister,
    showTimeInForceSelect,
    showGoodUntilInput,
    showPostOnlyCheckbox,
    showTwapRandomOrderCheckbox,
  };
}
