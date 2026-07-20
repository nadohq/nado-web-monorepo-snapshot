import type { SavedGridLayoutItem } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import {
  DESKTOP_TRADING_GRID_ITEM_CONFIG,
  type DesktopTradingGridItemId,
} from 'client/modules/trading/layout/consts';
import { useTradingGridLayout } from 'client/modules/trading/layout/hooks/useTradingGridLayout';
import { useCallback } from 'react';

/**
 * Manages grid layout state, container width measurement, and row height for the desktop trading grid.
 * @returns Trading grid layout inputs for react-grid-layout.
 */
export function useDesktopTradingGridLayout() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const setSavedLayout = useCallback(
    (newLayout: Record<DesktopTradingGridItemId, SavedGridLayoutItem>) => {
      setSavedUserState((prev) => {
        prev.trading.gridLayout.desktop = newLayout;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return useTradingGridLayout({
    itemConfig: DESKTOP_TRADING_GRID_ITEM_CONFIG,
    savedLayout: savedUserState.trading.gridLayout.desktop,
    setSavedLayout,
  });
}
