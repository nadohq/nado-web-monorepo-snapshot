import { BigNumber } from 'bignumber.js';
import { useLinkedAmountFractionInputEffects } from 'client/hooks/ui/form/useLinkedAmountFractionInputEffects';
import {
  DepositFormValues,
  DepositProductSelectValue,
} from 'client/modules/collateral/deposit/types';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Params {
  useDepositForm: UseFormReturn<DepositFormValues>;
  productIdInput: number;
  selectedProduct: DepositProductSelectValue | undefined;
  validAmount: BigNumber | undefined;
  validAmountFraction: number | undefined;
}

export function useDepositFormOnChangeSideEffects({
  useDepositForm,
  productIdInput,
  selectedProduct,
  validAmount,
  validAmountFraction,
}: Params) {
  // Reset form on product ID change
  useEffect(
    () => {
      useDepositForm.resetField('amount');
      useDepositForm.setValue('amountFraction', 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productIdInput],
  );

  useLinkedAmountFractionInputEffects({
    validAmount,
    validAmountFraction,
    maxAmount: selectedProduct?.decimalAdjustedWalletBalance,
    form: useDepositForm,
  });
}
