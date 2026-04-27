import { useRequiredContext } from '@nadohq/react-client';
import { TradingTableTabFilterId } from 'client/modules/localstorage/userState/types/tradingSettings';
import { createContext } from 'react';

export interface TradingTableTabsFiltersContextData {
  /**
   * Product ID for current page/context
   */
  productId: number | undefined;

  /**
   * Filter to display for the current tab
   */
  displayFilter: TradingTableTabFilterId | undefined;
}

export const TradingTableTabsFiltersContext =
  createContext<TradingTableTabsFiltersContextData | null>(null);

export const useTradingTableTabsFiltersContext = () =>
  useRequiredContext(TradingTableTabsFiltersContext);
