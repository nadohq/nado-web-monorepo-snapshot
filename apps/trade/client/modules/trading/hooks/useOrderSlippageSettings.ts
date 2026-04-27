import {
  OrderSlippageSettings,
  OrderSlippageType,
} from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { DEFAULT_ORDER_SLIPPAGE } from 'client/modules/trading/consts/defaultOrderSlippage';
import { useCallback } from 'react';

interface UseOrderSlippageSettings {
  savedSettings: OrderSlippageSettings;
  setSavedSettingsForType: (type: OrderSlippageType, value: number) => void;
  defaults: OrderSlippageSettings;
}

export function useOrderSlippageSettings(): UseOrderSlippageSettings {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const savedSettings = savedUserState.trading.slippage;

  const setSavedSettingsForType = useCallback(
    (type: OrderSlippageType, value: number) => {
      setSavedUserState((prev) => {
        prev.trading.slippage[type] = value;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return {
    savedSettings,
    setSavedSettingsForType,
    defaults: DEFAULT_ORDER_SLIPPAGE,
  };
}
