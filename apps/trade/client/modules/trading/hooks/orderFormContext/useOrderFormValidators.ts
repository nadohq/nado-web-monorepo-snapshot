import { InputValidatorFn, safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useScaledOrderFormValidators } from 'client/modules/trading/components/scaledOrder/hooks/useScaledOrderFormValidators';
import { useTwapOrderFormValidators } from 'client/modules/trading/components/twap/hooks/useTwapOrderFormValidators';
import {
  calcTwapNumberOfOrders,
  calcTwapSuborderAssetAmount,
} from 'client/modules/trading/components/twap/utils';
import {
  SCALED_ORDER_MAX_NUMBER_OF_ORDERS,
  SCALED_ORDER_MIN_NUMBER_OF_ORDERS,
} from 'client/modules/trading/consts/scaledOrder';
import {
  OrderFormInputError,
  OrderFormSizeDenom,
  OrderFormValidators,
  OrderFormValues,
  RoundAmountFn,
} from 'client/modules/trading/types/orderFormTypes';
import { isValidIncrementAmount } from 'client/modules/trading/utils/isValidIncrementAmount';
import { convertOrderSizeToAssetAmount } from 'client/modules/trading/utils/orderSizeConversions';
import { calcScaledOrderSmallestSuborderAssetAmount } from 'client/modules/trading/utils/scaledOrderUtils';
import {
  getRangeBigNumberValidator,
  positiveBigNumberValidator,
} from 'client/utils/inputValidators';
import { RefObject, useCallback } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface Params {
  form: UseFormReturn<OrderFormValues>;
  inputConversionPriceRef: RefObject<BigNumber | undefined>;
  maxAssetOrderSizeRef: RefObject<BigNumber | undefined>;
  decimalAdjustedSizeIncrement: BigNumber | undefined;
  priceIncrement: BigNumber | undefined;
  minAssetOrderSize: BigNumber | undefined;
  enableMaxSizeLogic: boolean;
  sizeDenom: OrderFormSizeDenom;
  roundAssetAmount: RoundAmountFn;
}

export function useOrderFormValidators({
  form,
  inputConversionPriceRef,
  maxAssetOrderSizeRef,
  minAssetOrderSize,
  priceIncrement,
  decimalAdjustedSizeIncrement,
  enableMaxSizeLogic,
  sizeDenom,
  roundAssetAmount,
}: Params): OrderFormValidators {
  const [
    orderType,
    twapDurationHoursInput,
    twapDurationMinutesInput,
    twapFrequencyInSeconds,
    scaledOrderNumberOfOrdersInput,
    scaledOrderSizeDistributionType,
  ] = useWatch({
    control: form.control,
    name: [
      'orderType',
      'twapOrder.durationHours',
      'twapOrder.durationMinutes',
      'twapOrder.frequencyInSeconds',
      'scaledOrder.numberOfOrders',
      'scaledOrder.sizeDistributionType',
    ],
  });

  const { validateTwapDurationHours, validateTwapDurationMinutes } =
    useTwapOrderFormValidators();

  const {
    validateScaledOrderStartPrice,
    validateScaledOrderEndPrice,
    validateScaledOrderNumberOfOrders,
  } = useScaledOrderFormValidators({ priceIncrement });

  const validateSize = useCallback<
    InputValidatorFn<string, OrderFormInputError>
  >(
    (val) => {
      if (!val) {
        return;
      }

      const parsed = positiveBigNumberValidator.safeParse(val);

      if (!parsed.success) {
        return 'invalid_size_input';
      }

      const isTwap = orderType === 'twap';
      const isScaledOrder = orderType === 'multi_limit';
      const inputConversionPrice = inputConversionPriceRef.current;
      const maxAssetOrderSize = maxAssetOrderSizeRef.current;
      const assetAmount = convertOrderSizeToAssetAmount({
        size: parsed.data,
        sizeDenom,
        conversionPrice: inputConversionPrice,
        roundAssetAmount,
      });

      if (!assetAmount) {
        return 'invalid_size_input';
      }

      if (minAssetOrderSize?.gt(assetAmount)) {
        return 'below_min';
      }

      // This error is only possible if we have asset denom.
      // As we round quote amounts to the nearest increment of asset amount in convertOrderSizeToAssetAmount.
      if (
        decimalAdjustedSizeIncrement &&
        !isValidIncrementAmount(assetAmount, decimalAdjustedSizeIncrement)
      ) {
        return 'invalid_size_increment';
      }

      if (isTwap) {
        const numberOfOrders = calcTwapNumberOfOrders(
          {
            hours: twapDurationHoursInput,
            minutes: twapDurationMinutesInput,
          },
          twapFrequencyInSeconds,
        );

        const twapAssetAmountPerSuborder = calcTwapSuborderAssetAmount({
          orderAssetAmount: assetAmount,
          numberOfOrders,
          roundAssetAmount,
        });

        if (
          twapAssetAmountPerSuborder &&
          minAssetOrderSize?.gt(twapAssetAmountPerSuborder)
        ) {
          return 'twap_amount_per_suborder_size_below_min';
        }
      }

      if (isScaledOrder) {
        const validatedNumberOfOrders = safeParseForData(
          getRangeBigNumberValidator({
            minInclusive: SCALED_ORDER_MIN_NUMBER_OF_ORDERS,
            maxInclusive: SCALED_ORDER_MAX_NUMBER_OF_ORDERS,
          }),
          scaledOrderNumberOfOrdersInput,
        );

        const smallestSuborderAssetAmount =
          calcScaledOrderSmallestSuborderAssetAmount({
            orderAssetAmount: assetAmount,
            numberOfOrders: validatedNumberOfOrders,
            sizeDistributionType: scaledOrderSizeDistributionType,
            roundAssetAmount,
          });

        if (
          smallestSuborderAssetAmount &&
          minAssetOrderSize?.gt(smallestSuborderAssetAmount)
        ) {
          return 'scaled_order_asset_amount_per_order_size_below_min';
        }
      }

      if (
        enableMaxSizeLogic &&
        maxAssetOrderSize &&
        maxAssetOrderSize.lt(assetAmount)
      ) {
        return 'max_exceeded';
      }
    },
    [
      orderType,
      inputConversionPriceRef,
      maxAssetOrderSizeRef,
      sizeDenom,
      roundAssetAmount,
      minAssetOrderSize,
      enableMaxSizeLogic,
      decimalAdjustedSizeIncrement,
      twapDurationHoursInput,
      twapDurationMinutesInput,
      twapFrequencyInSeconds,
      scaledOrderNumberOfOrdersInput,
      scaledOrderSizeDistributionType,
    ],
  );

  const validateLimitPrice = useCallback<
    InputValidatorFn<string, OrderFormInputError>
  >(
    (val) => {
      if (!val) {
        return;
      }

      const parsed = positiveBigNumberValidator.safeParse(val);
      if (!parsed.success) {
        return 'invalid_limit_price_input';
      } else if (priceIncrement) {
        if (!isValidIncrementAmount(val, priceIncrement)) {
          return 'invalid_limit_price_increment';
        }
      }
    },
    [priceIncrement],
  );

  const validateTriggerPrice = useCallback<
    InputValidatorFn<string, OrderFormInputError>
  >(
    (val) => {
      if (!val) {
        return;
      }

      const parsed = positiveBigNumberValidator.safeParse(val);
      if (!parsed.success) {
        return 'invalid_trigger_price_input';
      } else if (priceIncrement) {
        if (!isValidIncrementAmount(val, priceIncrement)) {
          return 'invalid_trigger_price_increment';
        }
      }
    },
    [priceIncrement],
  );

  const validateTimeInForceInDays = useCallback<
    InputValidatorFn<string, OrderFormInputError>
  >((val) => {
    if (!val) {
      return;
    }

    const parsed = positiveBigNumberValidator.safeParse(val);

    if (!parsed.success || !parsed.data.isInteger()) {
      return 'time_in_force_in_days_invalid_input';
    } else if (parsed.data.gt(365)) {
      return 'time_in_force_in_days_out_of_range';
    }
  }, []);

  return {
    size: validateSize,
    limitPrice: validateLimitPrice,
    triggerPrice: validateTriggerPrice,
    timeInForceInDays: validateTimeInForceInDays,
    twapDurationHours: validateTwapDurationHours,
    twapDurationMinutes: validateTwapDurationMinutes,
    scaledOrderStartPrice: validateScaledOrderStartPrice,
    scaledOrderEndPrice: validateScaledOrderEndPrice,
    scaledOrderNumberOfOrders: validateScaledOrderNumberOfOrders,
  };
}
