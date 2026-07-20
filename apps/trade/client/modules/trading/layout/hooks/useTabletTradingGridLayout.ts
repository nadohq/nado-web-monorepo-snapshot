import { useCallback } from 'react';

import type { SavedGridLayoutItem } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import {
  TABLET_TRADING_GRID_ITEM_CONFIG,
  type TabletTradingGridItemId,
} from 'client/modules/trading/layout/consts';
import { useTradingGridLayout } from 'client/modules/trading/layout/hooks/useTradingGridLayout';

/**
 * Manages grid layout state, container width measurement, and row height for the tablet trading grid.
 * @returns Trading grid layout inputs for react-grid-layout.
 */
export function useTabletTradingGridLayout() {
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const setSavedLayout = useCallback(
    (newLayout: Record<TabletTradingGridItemId, SavedGridLayoutItem>) => {
      setSavedUserState((prev) => {
        prev.trading.gridLayout.tablet = newLayout;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return useTradingGridLayout({
    itemConfig: TABLET_TRADING_GRID_ITEM_CONFIG,
    savedLayout: savedUserState.trading.gridLayout.tablet,
    setSavedLayout,
  });
}
