import { TradingTableTabFilterId } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useTradingTableTabsFiltersContext } from 'client/modules/trading/components/TradingTableTabs/TradingTableTabsFilters/TradingTableTabsFiltersContext';
import { useMemo } from 'react';

interface UseTradingTableTabsFilters {
  visibleProductIds?: number[];
  hideSmallBalances?: boolean;
  displayFilter?: TradingTableTabFilterId;
}

export function useTradingTableTabsFilters(): UseTradingTableTabsFilters {
  const { productId, displayFilter } = useTradingTableTabsFiltersContext();

  const { savedUserState } = useSavedUserState();

  const { showAllMarkets, hideSmallBalances } =
    savedUserState.trading.tradingTableTabFilters;

  const filters = useMemo(() => {
    switch (displayFilter) {
      case 'showAllMarkets':
        if (productId && !showAllMarkets) {
          return { visibleProductIds: [productId] };
        }
        return {};
      case 'hideSmallBalances':
        return { hideSmallBalances };
      case undefined:
        return {};
    }
  }, [displayFilter, productId, showAllMarkets, hideSmallBalances]);

  return {
    displayFilter,
    ...filters,
  };
}
