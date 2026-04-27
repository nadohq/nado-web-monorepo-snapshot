import { useMarketRestrictions } from '@nadohq/react-client';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { MarginMode } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback, useMemo } from 'react';

export function useSelectedPerpMarginMode(productId: number | undefined) {
  const { savedUserState, setSavedUserState } = useSavedUserState();
  const { data: allMarketsData } = useAllMarkets();
  const { data: marketRestrictions } = useMarketRestrictions();
  const leverageByProductId = savedUserState.trading.leverageByProductId;
  const marginModeSettings = savedUserState.trading.marginMode;

  const isIsolatedOnly =
    !!productId && Boolean(marketRestrictions?.[productId]?.isolatedOnly);

  const market = productId ? allMarketsData?.perpMarkets[productId] : undefined;
  const maxLeverage = market?.maxLeverage ?? 1;

  /**
   * Legacy cross-margin settings
   */

  const persistedCrossMarginLeverageSelection = productId
    ? leverageByProductId[productId]
    : undefined;

  const selectedCrossMarginLeverage = useMemo(() => {
    if (!persistedCrossMarginLeverageSelection) {
      return maxLeverage;
    }

    return Math.min(maxLeverage, persistedCrossMarginLeverageSelection);
  }, [maxLeverage, persistedCrossMarginLeverageSelection]);

  const setSelectedCrossMarginLeverage = useCallback(
    (selectedValue: number) => {
      if (!productId) {
        return;
      }

      setSavedUserState((prev) => {
        prev.trading.leverageByProductId[productId] = Math.min(
          maxLeverage,
          selectedValue,
        );
        return prev;
      });
    },
    [maxLeverage, productId, setSavedUserState],
  );

  /**
   * New Iso / Cross margin settings
   */
  const savedMarginModeForProduct = productId
    ? marginModeSettings.lastSelected[productId]
    : undefined;

  const selectedMarginMode = useMemo((): MarginMode => {
    const selectedLeverage = Math.min(
      savedMarginModeForProduct?.leverage ?? maxLeverage,
      maxLeverage,
    );
    const selectedIsoEnableBorrows =
      savedMarginModeForProduct?.enableBorrows ?? true;

    if (isIsolatedOnly) {
      return {
        mode: 'isolated',
        leverage: selectedLeverage,
        enableBorrows: selectedIsoEnableBorrows,
      };
    }

    if (!savedMarginModeForProduct) {
      switch (marginModeSettings.default) {
        case 'isolated':
          return {
            mode: 'isolated',
            // Without a saved setting, these will just be computed as defaults
            leverage: selectedLeverage,
            enableBorrows: selectedIsoEnableBorrows,
          };
        case 'cross':
          return {
            mode: 'cross',
            leverage: selectedLeverage,
          };
      }
    }

    // Perform a sanity check on the saved leverage selection
    return {
      ...savedMarginModeForProduct,
      leverage: selectedLeverage,
    };
  }, [
    isIsolatedOnly,
    marginModeSettings.default,
    maxLeverage,
    savedMarginModeForProduct,
  ]);

  const setSelectedMarginMode = useCallback(
    (newValue: MarginMode) => {
      if (!productId) {
        return;
      }

      setSavedUserState((prev) => {
        prev.trading.marginMode.lastSelected[productId] = {
          ...newValue,
          leverage: Math.min(maxLeverage, newValue.leverage),
        };
        return prev;
      });
    },
    [maxLeverage, productId, setSavedUserState],
  );

  return {
    selectedCrossMarginLeverage,
    setSelectedCrossMarginLeverage,
    selectedMarginMode,
    setSelectedMarginMode,
  };
}
