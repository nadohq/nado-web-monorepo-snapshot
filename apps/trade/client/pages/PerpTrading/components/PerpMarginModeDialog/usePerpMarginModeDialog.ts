import { useMarketRestrictions } from '@nadohq/react-client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSelectedPerpMarginMode } from 'client/pages/PerpTrading/hooks/useSelectedPerpMarginMode';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function usePerpMarginModeDialog({ productId }: { productId: number }) {
  const { hide } = useDialog();
  const {
    selectedMarginMode: savedMarginMode,
    setSelectedMarginMode: setSavedMarginMode,
  } = useSelectedPerpMarginMode(productId);
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const { data: marketRestrictions } = useMarketRestrictions();
  const { t } = useTranslation();

  const currentMarket = allMarketsStaticData?.perpMarkets[productId];
  const isIsolatedOnly = Boolean(marketRestrictions?.[productId]?.isolatedOnly);

  const maxLeverage = currentMarket?.maxLeverage ?? 1;

  const marginModeTabs = useMemo(
    () => [
      {
        id: 'isolated' as MarginModeType,
        label: t(($) => $.isolated),
        disabled: false,
      },
      {
        id: 'cross' as MarginModeType,
        label: t(($) => $.cross),
        disabled: isIsolatedOnly,
      },
    ],
    [isIsolatedOnly, t],
  );

  const {
    selectedTabId: selectedMarginModeTabId,
    setSelectedUntypedTabId: setSelectedMarginModeTabId,
  } = useTabs(marginModeTabs);
  const [enableIsoBorrows, setEnableIsoBorrows] = useState(true);

  // Sync with saved data
  useEffect(() => {
    setSelectedMarginModeTabId(savedMarginMode.mode);

    if (savedMarginMode.mode === 'isolated') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- we want to sync the enable iso borrows state when the saved margin mode changes
      setEnableIsoBorrows(savedMarginMode.enableBorrows);
    }
  }, [savedMarginMode, setSelectedMarginModeTabId]);

  const onSaveClick = useCallback(() => {
    switch (selectedMarginModeTabId) {
      case 'isolated':
        setSavedMarginMode({
          mode: 'isolated',
          leverage: savedMarginMode.leverage,
          enableBorrows: enableIsoBorrows,
        });
        break;
      case 'cross':
        setSavedMarginMode({
          mode: 'cross',
          leverage: savedMarginMode.leverage,
        });
        break;
    }

    hide();
  }, [
    selectedMarginModeTabId,
    hide,
    setSavedMarginMode,
    savedMarginMode.leverage,
    enableIsoBorrows,
  ]);

  return {
    hide,
    selectedMarginModeTabId,
    setSelectedMarginModeTabId,
    marginModeTabs,
    currentMarket,
    maxLeverage,
    enableIsoBorrows,
    setEnableIsoBorrows,
    onSaveClick,
    isIsolatedOnly,
  };
}
