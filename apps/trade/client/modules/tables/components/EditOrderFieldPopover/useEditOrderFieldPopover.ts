import { addDecimals, removeDecimals, toBigNumber } from '@nadohq/client';
import { safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { ModifyOrderParams } from 'client/hooks/execute/modifyOrder/types';
import { useExecuteModifyOrder } from 'client/hooks/execute/modifyOrder/useExecuteModifyOrder';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useEditOrderFieldErrorTooltipContent } from 'client/modules/tables/components/EditOrderFieldPopover/useEditOrderFieldErrorTooltipContent';
import {
  EditOrderFieldErrorType,
  useEditOrderFieldValidator,
} from 'client/modules/tables/components/EditOrderFieldPopover/useEditOrderFieldValidator';
import { watchFormError } from 'client/utils/form/watchFormError';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { roundToIncrement } from 'client/utils/rounding';
import { useCallback, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type EditOrderField = 'orderPrice' | 'triggerPrice' | 'amount';

interface EditOrderFieldFormValues {
  value: string;
}

interface UseEditOrderFieldPopoverParams {
  currentValue: BigNumber;
  productId: number;
  digest: string;
  /** Whether this is a trigger order (stop market, stop limit, TP/SL) */
  isTrigger: boolean;
  /** Which field to modify */
  field: EditOrderField;
  /** Order price used for minimum notional validation (required for amount field) */
  orderPrice: BigNumber | undefined;
}

export function useEditOrderFieldPopover({
  currentValue,
  productId,
  digest,
  isTrigger,
  field,
  orderPrice,
}: UseEditOrderFieldPopoverParams) {
  const { t } = useTranslation();

  const { mutateAsync: modifyOrderAsync, isPending } = useExecuteModifyOrder();
  const { dispatchNotification } = useNotificationManagerContext();
  const { data: marketsStaticData } = useAllMarketsStaticData();

  const marketData = marketsStaticData?.allMarkets[productId];

  const label = (() => {
    switch (field) {
      case 'orderPrice':
        return t(($) => $.price);
      case 'triggerPrice':
        return t(($) => $.trigger);
      case 'amount':
        return t(($) => $.amount);
    }
  })();

  const increment = (() => {
    switch (field) {
      case 'orderPrice':
      case 'triggerPrice':
        return marketData?.priceIncrement;
      case 'amount':
        return removeDecimals(marketData?.sizeIncrement);
    }
  })();

  // Calculate minimum asset size from minimum notional (only for amount field)
  // minSize is in quote currency (USDT0), so we divide by order price to get asset size
  const minValue = useMemo(() => {
    if (field !== 'amount' || !marketData || !orderPrice) {
      return undefined;
    }

    const decimalAdjustedMinSize = removeDecimals(marketData.minSize);
    const decimalAdjustedSizeIncrement = removeDecimals(
      marketData.sizeIncrement,
    );

    const minSize = decimalAdjustedMinSize.div(orderPrice);

    return roundToIncrement(
      minSize,
      decimalAdjustedSizeIncrement,
      BigNumber.ROUND_UP,
    );
  }, [field, marketData, orderPrice]);

  // Use absolute value for display (prices are always positive, amounts may be negative for shorts)
  const absValue = currentValue.abs();

  const form = useForm<EditOrderFieldFormValues>({
    defaultValues: {
      value: absValue.toString(),
    },
    mode: 'onChange',
  });

  const formError = watchFormError<
    EditOrderFieldFormValues,
    EditOrderFieldErrorType
  >(form, 'value');

  const errorTooltipContent = useEditOrderFieldErrorTooltipContent(
    formError,
    increment,
    minValue,
  );

  const value = useWatch({ control: form.control, name: 'value' });

  const validValue = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, value);
  }, [value]);

  // Use absolute value for validation so the "value_unchanged" check works correctly
  const validateField = useEditOrderFieldValidator(
    increment,
    absValue,
    minValue,
  );

  const [isOpen, setIsOpen] = useState(false);

  // Reset to current value when popover opens/closes (handles case where value changed externally)
  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      form.reset({ value: absValue.toString() });
    },
    [form, absValue],
  );

  const onSubmit = useCallback(
    async (values: EditOrderFieldFormValues) => {
      const newValue = toBigNumber(values.value);

      const baseParams = { productId, digest, isPriceTrigger: isTrigger };
      const mutationParams = ((): ModifyOrderParams => {
        switch (field) {
          case 'orderPrice':
            return { ...baseParams, newPrice: newValue };
          case 'triggerPrice':
            return { ...baseParams, newTriggerPrice: newValue };
          case 'amount': {
            // Preserve the sign of the original amount (negative for shorts)
            const signedAmount = newValue.multipliedBy(currentValue.s ?? 1);
            return { ...baseParams, newAmount: addDecimals(signedAmount) };
          }
        }
      })();

      const serverExecutionResult = modifyOrderAsync(mutationParams, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });

      dispatchNotification({
        type: 'action_error_handler',
        data: {
          errorNotificationTitle: t(($) => $.errors.orderModificationFailed),
          executionData: { serverExecutionResult },
        },
      });
    },
    [
      modifyOrderAsync,
      productId,
      digest,
      isTrigger,
      field,
      currentValue,
      dispatchNotification,
      onOpenChange,
      t,
    ],
  );

  const isSubmitDisabled = !validValue || !!formError || isPending;

  const setFieldInput = useCallback(
    (input: string) => {
      form.setValue('value', input, { shouldValidate: true });
    },
    [form],
  );

  return {
    form,
    isOpen,
    onOpenChange,
    isPending,
    isSubmitDisabled,
    errorTooltipContent,
    increment,
    productId,
    label,
    validateField,
    onSubmit: form.handleSubmit(onSubmit),
    setFieldInput,
  };
}
