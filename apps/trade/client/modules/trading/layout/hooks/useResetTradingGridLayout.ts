import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import {
  DEFAULT_DESKTOP_TRADING_GRID_LAYOUT,
  DEFAULT_TABLET_TRADING_GRID_LAYOUT,
} from 'client/modules/trading/layout/consts';
import { useCallback } from 'react';

export function useResetTradingGridLayout() {
  const { setSavedUserState } = useSavedUserState();

  const resetGridLayout = useCallback(() => {
    setSavedUserState((prev) => {
      prev.trading.gridLayout = {
        desktop: DEFAULT_DESKTOP_TRADING_GRID_LAYOUT,
        tablet: DEFAULT_TABLET_TRADING_GRID_LAYOUT,
      };
      return prev;
    });
  }, [setSavedUserState]);

  return { resetGridLayout };
}
