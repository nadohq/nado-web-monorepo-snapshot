import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { xor } from 'lodash';
import { useCallback, useMemo } from 'react';

interface UseFavoritedMarkets {
  favoritedMarketIds: Set<number>;
  toggleIsFavoritedMarket: (marketId: number) => void;
  didLoadPersistedValue: boolean;
}

export function useFavoritedMarkets(): UseFavoritedMarkets {
  const { savedUserState, setSavedUserState, didLoadPersistedValue } =
    useSavedUserState();

  const toggleIsFavoritedMarket = useCallback(
    (marketId: number) => {
      setSavedUserState((prev) => {
        // Toggle marketId from array.
        prev.trading.favoriteMarketIds = xor(prev.trading.favoriteMarketIds, [
          marketId,
        ]);

        return prev;
      });
    },
    [setSavedUserState],
  );

  const favoritedMarketIds = useMemo(() => {
    return new Set(savedUserState.trading.favoriteMarketIds);
  }, [savedUserState.trading.favoriteMarketIds]);

  return {
    favoritedMarketIds,
    toggleIsFavoritedMarket,
    didLoadPersistedValue,
  };
}
