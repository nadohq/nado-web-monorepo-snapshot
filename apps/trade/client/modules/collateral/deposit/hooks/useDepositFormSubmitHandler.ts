import { addDecimals } from '@nadohq/client';
import { useExecuteApproveAllowanceForProduct } from 'client/hooks/execute/useExecuteApproveAllowanceForProduct';
import { useExecuteDepositCollateral } from 'client/hooks/execute/useExecuteDepositCollateral';
import {
  DepositFormValues,
  DepositProductSelectValue,
} from 'client/modules/collateral/deposit/types';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { resolveAmountFractionSubmitValue } from 'client/utils/form/resolveAmountFractionSubmitValue';
import { roundToString } from 'client/utils/rounding';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { maxUint256 } from 'viem';

interface Params {
  useDepositForm: UseFormReturn<DepositFormValues>;
  selectedProduct: DepositProductSelectValue | undefined;
  isApprove: boolean;
  mutateApproveAllowanceAsync: ReturnType<
    typeof useExecuteApproveAllowanceForProduct
  >['mutateAsync'];
  mutateDepositCollateralAsync: ReturnType<
    typeof useExecuteDepositCollateral
  >['mutateAsync'];
}

export function useDepositFormSubmitHandler({
  useDepositForm,
  selectedProduct,
  isApprove,
  mutateApproveAllowanceAsync,
  mutateDepositCollateralAsync,
}: Params) {
  const { t } = useTranslation();
  const { dispatchNotification } = useNotificationManagerContext();

  return (values: DepositFormValues) => {
    if (selectedProduct == null) {
      console.warn('[useDepositFormSubmitHandler] No selected product');
      return;
    }

    const amount = resolveAmountFractionSubmitValue(
      values,
      selectedProduct.decimalAdjustedWalletBalance,
    );
    if (amount.lte(0)) {
      console.warn(
        '[useDepositFormSubmitHandler] Invalid amount',
        amount.toString(),
      );
      return;
    }

    const amountWithAddedDecimals = addDecimals(
      amount,
      selectedProduct.tokenDecimals,
    );

    if (isApprove) {
      const txHashPromise = mutateApproveAllowanceAsync({
        productId: selectedProduct.productId,
        amount: maxUint256,
      });
      dispatchNotification({
        type: 'action_error_handler',
        data: {
          errorNotificationTitle: t(($) => $.errors.approvalFailed),
          executionData: {
            txHashPromise,
          },
        },
      });
    } else {
      const txHashPromise = mutateDepositCollateralAsync(
        {
          productId: selectedProduct.productId,
          amount: roundToString(amountWithAddedDecimals, 0),
        },
        {
          // Reset the form on success
          onSuccess: () => {
            useDepositForm.setValue('amountFraction', 0);
            useDepositForm.resetField('amount');
            useDepositForm.resetField('amountSource');
          },
        },
      );
      dispatchNotification({
        type: 'action_error_handler',
        data: {
          errorNotificationTitle: t(($) => $.errors.depositFailed),
          executionData: {
            txHashPromise,
          },
        },
      });
    }
  };
}
