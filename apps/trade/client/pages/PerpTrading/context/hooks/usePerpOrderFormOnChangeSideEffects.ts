import { BalanceSide } from '@nadohq/client';
import { MarginMode } from 'client/modules/localstorage/userState/types/tradingSettings';
import { OrderFormValues } from 'client/modules/trading/types/orderFormTypes';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Params {
  form: UseFormReturn<OrderFormValues>;
  marginMode: MarginMode;
  isTpSlCheckboxDisabled: boolean;
  setIsTpSlCheckboxChecked: (isChecked: boolean) => void;
  orderSide: BalanceSide;
  resetTpSlForm: () => void;
}

export function usePerpOrderFormOnChangeSideEffects({
  form,
  marginMode,
  isTpSlCheckboxDisabled,
  setIsTpSlCheckboxChecked,
  orderSide,
  resetTpSlForm,
}: Params) {
  // Reset amounts on margin mode changes
  useEffect(
    () => {
      // Reset amount fields and keep the rest
      form.setValue('amountFraction', 0);
      form.resetField('size');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marginMode.leverage, marginMode.mode],
  );

  // Uncheck the TP/SL checkbox when it's disabled.
  useEffect(() => {
    if (isTpSlCheckboxDisabled) {
      setIsTpSlCheckboxChecked(false);
    }
  }, [setIsTpSlCheckboxChecked, isTpSlCheckboxDisabled]);

  // Reset the TPSL form on side change otherwise they may become invalid
  // when switching sides without any error indication in the form.
  useEffect(() => {
    resetTpSlForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderSide]);
}
