import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useShowUserDisclosure } from 'client/modules/localstorage/userState/useShowUserDisclosure';
import { OrderFormValues } from 'client/modules/trading/types/orderFormTypes';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface Params {
  form: UseFormReturn<OrderFormValues>;
  spotLeverageEnabled: boolean;
}
export function useSpotOrderFormOnChangeSideEffects({
  form,
  spotLeverageEnabled,
}: Params) {
  const { show } = useDialog();
  const isConnected = useIsConnected();
  const { shouldShow: shouldShowSpotLeverageOnRiskDisclosure } =
    useShowUserDisclosure('spot_leverage_on_risk');

  const orderType = useWatch({
    control: form.control,
    name: 'orderType',
  });

  // Reset amounts on leverage change
  useEffect(
    () => {
      // Reset numerical fields and keep the rest
      form.setValue('amountFraction', 0);
      form.resetField('size');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spotLeverageEnabled],
  );

  // Reset order type to market if leverage is disabled and current order type is TWAP
  useEffect(
    () => {
      if (!spotLeverageEnabled && orderType === 'twap') {
        form.setValue('orderType', 'market');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spotLeverageEnabled],
  );

  // Trigger spot leverage on dialog when showSpotLeverageOnRiskDisclosure becomes true
  const showSpotLeverageOnDialog =
    isConnected &&
    spotLeverageEnabled &&
    shouldShowSpotLeverageOnRiskDisclosure;

  useEffect(() => {
    if (showSpotLeverageOnDialog) {
      show({
        type: 'spot_leverage_on',
        params: {},
      });
    }
  }, [showSpotLeverageOnDialog, show]);
}
