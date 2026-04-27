import { OrderSlippageFormForType } from 'client/modules/settings/components/OrderSlippageSettings/OrderSlippageFormForType';
import { useOrderSlippageSettingForms } from 'client/modules/settings/components/OrderSlippageSettings/hooks/useOrderSlippageSettingForms';

export function OrderSlippageSettings() {
  const { forms } = useOrderSlippageSettingForms();

  return (
    <>
      <OrderSlippageFormForType formForType={forms.market} />
      <OrderSlippageFormForType formForType={forms.stopMarket} />
      <OrderSlippageFormForType formForType={forms.takeProfit} />
      <OrderSlippageFormForType formForType={forms.stopLoss} />
    </>
  );
}
