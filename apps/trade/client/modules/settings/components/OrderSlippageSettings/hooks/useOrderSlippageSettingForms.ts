import { OrderSlippageType } from 'client/modules/localstorage/userState/types/tradingSettings';
import {
  useOrderSlippageSettingForType,
  UseOrderSlippageSettingForType,
} from 'client/modules/settings/components/OrderSlippageSettings/hooks/useOrderSlippageFormForType';

export interface UseOrderSlippageSettingForms {
  forms: Record<OrderSlippageType, UseOrderSlippageSettingForType>;
  saveAll: () => void;
}

export function useOrderSlippageSettingForms(): UseOrderSlippageSettingForms {
  const forms: UseOrderSlippageSettingForms['forms'] = {
    market: useOrderSlippageSettingForType('market'),
    stopLoss: useOrderSlippageSettingForType('stopLoss'),
    stopMarket: useOrderSlippageSettingForType('stopMarket'),
    takeProfit: useOrderSlippageSettingForType('takeProfit'),
  };

  const saveAll = () => {
    Object.values(forms).forEach((form) => {
      form.save();
    });
  };

  return {
    forms,
    saveAll,
  };
}
