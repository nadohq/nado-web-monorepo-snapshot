import { ProductEngineType } from '@nadohq/client';
import {
  useMarketRestrictions,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useExecutePlaceOrder } from 'client/hooks/execute/placeOrder/useExecutePlaceOrder';
import { useQueryAllMarketsLatestPrices } from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { MarginMode } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { TradingViewSymbolInfo } from 'client/modules/trading/chart/config/datafeedConfig';
import { NadoBrokerDeps } from 'client/modules/trading/chart/types';
import { useOrderSlippageSettings } from 'client/modules/trading/hooks/useOrderSlippageSettings';
import { getIsIsolatedOnly } from 'client/modules/trading/utils/getIsIsolatedOnly';
import { resolvePerpMarginMode } from 'client/modules/trading/utils/resolvePerpMarginMode';
import { RefObject, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Bridges React state into a mutable ref that the plain NadoBroker class can
 * read from on every Broker API call. Kept narrow on purpose: only what
 * placeOrder needs. Re-add fields here when the broker grows new methods.
 *
 * symbolInfoByProductId is computed by useTradingViewData (the same map TV
 * uses for symbol resolution) and threaded through here so the broker has a
 * single source of per-product data.
 */
export function useBrokerDependencies(
  symbolInfoByProductId: Record<number, TradingViewSymbolInfo> | undefined,
): RefObject<NadoBrokerDeps> {
  const { t } = useTranslation();
  const {
    currentSubaccount: { address },
  } = useSubaccountContext();

  const { data: latestMarketPrices } = useQueryAllMarketsLatestPrices();
  const { data: latestOraclePrices } = useQueryLatestOraclePrices();
  const { savedSettings: slippageSettings } = useOrderSlippageSettings();

  const { mutateAsync: executePlaceOrder } = useExecutePlaceOrder();

  // Persisted user settings for spot margin (cross-borrow toggle) and per-
  // product perp margin mode + leverage. Mirrors the side order panel so
  // chart-placed orders honor the same selection without on-chart toggles.
  const { savedUserState } = useSavedUserState();
  const { data: marketRestrictions } = useMarketRestrictions();
  // Used to decide isReducingIsoPosition (matches useOrderFormSubmitHandler).
  const { data: perpPositions } = usePerpPositions();

  const spotLeverageEnabled = savedUserState.trading.spotLeverageEnabled;
  const marginModeSettings = savedUserState.trading.marginMode;
  const enableCrossMarginForIsoOnlyMarkets =
    savedUserState.trading.enableCrossMarginForIsoOnlyMarkets;

  // Resolves the persisted iso/cross + leverage selection for a perp
  // product. Returns undefined for non-perp / unknown products so the
  // broker can short-circuit cleanly.
  const getPerpMarginMode = useCallback(
    (productId: number): MarginMode | undefined => {
      const symbolInfo = symbolInfoByProductId?.[productId];
      if (!symbolInfo) {
        return undefined;
      }
      const { marketData } = symbolInfo;
      if (marketData.type !== ProductEngineType.PERP) {
        return undefined;
      }

      return resolvePerpMarginMode({
        isIsolatedOnly: getIsIsolatedOnly({
          productId,
          marketRestrictions,
          enableCrossMarginForIsoOnlyMarkets,
        }),
        marketMaxLeverage: marketData.maxLeverage,
        savedMarginModeForProduct: marginModeSettings.lastSelected[productId],
        defaultMarginModeType: marginModeSettings.default,
      });
    },
    [
      symbolInfoByProductId,
      marketRestrictions,
      enableCrossMarginForIsoOnlyMarkets,
      marginModeSettings.default,
      marginModeSettings.lastSelected,
    ],
  );

  const { dispatchNotification } = useNotificationManagerContext();

  const deps: NadoBrokerDeps = {
    address,
    symbolInfoByProductId,
    latestMarketPrices,
    latestOraclePrices,
    slippageSettings,
    spotLeverageEnabled,
    getPerpMarginMode,
    perpPositions,
    placeOrder: executePlaceOrder,
    dispatchNotification,
    t,
  };

  return useSyncedRef(deps);
}
