import { SavedUserState } from 'client/modules/localstorage/userState/types/SavedUserState';
import { userStateSchema } from 'client/modules/localstorage/userState/userStateSchema';
import { validateOrReset } from 'client/modules/localstorage/utils/zodValidators';
import { DEFAULT_ORDER_SLIPPAGE } from 'client/modules/trading/consts/defaultOrderSlippage';
import { cloneDeep } from 'lodash';

const DEFAULT_USER_STATE: SavedUserState = Object.freeze<SavedUserState>({
  onboardingComplete: false,
  dismissedDisclosures: [],
  tutorial: {
    isDismissed: false,
    completedSteps: [],
  },
  fundingRatePeriod: '1h',
  notificationPosition: 'right',
  privacy: {
    areAccountValuesPrivate: false,
    isAddressPrivate: false,
  },
  profileBySubaccountKey: {},
  selectedSubaccountNameByChainEnv: {},
  signingPreferenceBySubaccountKey: {},
  trading: {
    consolePosition: 'right',
    favoriteMarketIds: [],
    leverageByProductId: {},
    marginMode: {
      default: 'cross',
      lastSelected: {},
    },
    orderbookTickSpacingMultiplierByProductId: {},
    showOrderbookTotalInQuote: false,
    spotLeverageEnabled: false,
    slippage: DEFAULT_ORDER_SLIPPAGE,
    tpSlTriggerPriceType: {
      takeProfit: 'last_price',
      stopLoss: 'oracle_price',
    },
    enableTradingNotifications: true,
    enableTradingOrderLines: true,
    enableTradingPositionLines: true,
    enableTradingOrderbookAnimations: true,
    enableChartMarks: true,
    enableQuickMarketClose: false,
    tradingTableTabFilters: {
      showAllMarkets: true,
      hideSmallBalances: false,
    },
    lastSelectedSpotMarketId: undefined,
    lastSelectedPerpMarketId: undefined,
    lastSelectedEngineOrderType: 'market',
    lastSelectedSizeDenom: 'asset',
    lastSelectedSide: 'long',
  },
  tables: {
    perpPositions: {
      columnVisibility: undefined,
      columnOrder: undefined,
    },
  },
});

/**
 * Validates each field of a partial user state against its schema, falling back to defaults
 * for invalid or missing values. This guards against malformed localStorage data and
 * interface changes over time.
 */
export function getUserStateWithDefaults(
  currentSaved: Partial<SavedUserState> | undefined,
): SavedUserState {
  const tutorialSchema = userStateSchema.shape.tutorial;
  const privacySchema = userStateSchema.shape.privacy;
  const tradingSchema = userStateSchema.shape.trading;

  const withDefaults: SavedUserState = {
    onboardingComplete: validateOrReset(
      currentSaved?.onboardingComplete,
      DEFAULT_USER_STATE.onboardingComplete,
      userStateSchema.shape.onboardingComplete,
    ),
    dismissedDisclosures: validateOrReset(
      currentSaved?.dismissedDisclosures,
      DEFAULT_USER_STATE.dismissedDisclosures,
      userStateSchema.shape.dismissedDisclosures,
    ),
    tutorial: {
      isDismissed: validateOrReset(
        currentSaved?.tutorial?.isDismissed,
        DEFAULT_USER_STATE.tutorial.isDismissed,
        tutorialSchema.shape.isDismissed,
      ),
      completedSteps: validateOrReset(
        currentSaved?.tutorial?.completedSteps,
        DEFAULT_USER_STATE.tutorial.completedSteps,
        tutorialSchema.shape.completedSteps,
      ),
    },
    fundingRatePeriod: validateOrReset(
      currentSaved?.fundingRatePeriod,
      DEFAULT_USER_STATE.fundingRatePeriod,
      userStateSchema.shape.fundingRatePeriod,
    ),
    notificationPosition: validateOrReset(
      currentSaved?.notificationPosition,
      DEFAULT_USER_STATE.notificationPosition,
      userStateSchema.shape.notificationPosition,
    ),
    privacy: {
      areAccountValuesPrivate: validateOrReset(
        currentSaved?.privacy?.areAccountValuesPrivate,
        DEFAULT_USER_STATE.privacy.areAccountValuesPrivate,
        privacySchema.shape.areAccountValuesPrivate,
      ),
      isAddressPrivate: validateOrReset(
        currentSaved?.privacy?.isAddressPrivate,
        DEFAULT_USER_STATE.privacy.isAddressPrivate,
        privacySchema.shape.isAddressPrivate,
      ),
    },
    profileBySubaccountKey: validateOrReset(
      currentSaved?.profileBySubaccountKey,
      DEFAULT_USER_STATE.profileBySubaccountKey,
      userStateSchema.shape.profileBySubaccountKey,
    ),
    selectedSubaccountNameByChainEnv: validateOrReset(
      currentSaved?.selectedSubaccountNameByChainEnv,
      DEFAULT_USER_STATE.selectedSubaccountNameByChainEnv,
      userStateSchema.shape.selectedSubaccountNameByChainEnv,
    ),
    signingPreferenceBySubaccountKey: validateOrReset(
      currentSaved?.signingPreferenceBySubaccountKey,
      DEFAULT_USER_STATE.signingPreferenceBySubaccountKey,
      userStateSchema.shape.signingPreferenceBySubaccountKey,
    ),
    trading: {
      consolePosition: validateOrReset(
        currentSaved?.trading?.consolePosition,
        DEFAULT_USER_STATE.trading.consolePosition,
        tradingSchema.shape.consolePosition,
      ),
      favoriteMarketIds: validateOrReset(
        currentSaved?.trading?.favoriteMarketIds,
        DEFAULT_USER_STATE.trading.favoriteMarketIds,
        tradingSchema.shape.favoriteMarketIds,
      ),
      leverageByProductId: validateOrReset(
        currentSaved?.trading?.leverageByProductId,
        DEFAULT_USER_STATE.trading.leverageByProductId,
        tradingSchema.shape.leverageByProductId,
      ),
      marginMode: validateOrReset(
        currentSaved?.trading?.marginMode,
        DEFAULT_USER_STATE.trading.marginMode,
        tradingSchema.shape.marginMode,
      ),
      orderbookTickSpacingMultiplierByProductId: validateOrReset(
        currentSaved?.trading?.orderbookTickSpacingMultiplierByProductId,
        DEFAULT_USER_STATE.trading.orderbookTickSpacingMultiplierByProductId,
        tradingSchema.shape.orderbookTickSpacingMultiplierByProductId,
      ),
      showOrderbookTotalInQuote: validateOrReset(
        currentSaved?.trading?.showOrderbookTotalInQuote,
        DEFAULT_USER_STATE.trading.showOrderbookTotalInQuote,
        tradingSchema.shape.showOrderbookTotalInQuote,
      ),
      spotLeverageEnabled: validateOrReset(
        currentSaved?.trading?.spotLeverageEnabled,
        DEFAULT_USER_STATE.trading.spotLeverageEnabled,
        tradingSchema.shape.spotLeverageEnabled,
      ),
      slippage: validateOrReset(
        currentSaved?.trading?.slippage,
        DEFAULT_USER_STATE.trading.slippage,
        tradingSchema.shape.slippage,
      ),
      tpSlTriggerPriceType: validateOrReset(
        currentSaved?.trading?.tpSlTriggerPriceType,
        DEFAULT_USER_STATE.trading.tpSlTriggerPriceType,
        tradingSchema.shape.tpSlTriggerPriceType,
      ),
      enableTradingNotifications: validateOrReset(
        currentSaved?.trading?.enableTradingNotifications,
        DEFAULT_USER_STATE.trading.enableTradingNotifications,
        tradingSchema.shape.enableTradingNotifications,
      ),
      enableTradingOrderLines: validateOrReset(
        currentSaved?.trading?.enableTradingOrderLines,
        DEFAULT_USER_STATE.trading.enableTradingOrderLines,
        tradingSchema.shape.enableTradingOrderLines,
      ),
      enableTradingPositionLines: validateOrReset(
        currentSaved?.trading?.enableTradingPositionLines,
        DEFAULT_USER_STATE.trading.enableTradingPositionLines,
        tradingSchema.shape.enableTradingPositionLines,
      ),
      enableTradingOrderbookAnimations: validateOrReset(
        currentSaved?.trading?.enableTradingOrderbookAnimations,
        DEFAULT_USER_STATE.trading.enableTradingOrderbookAnimations,
        tradingSchema.shape.enableTradingOrderbookAnimations,
      ),
      enableChartMarks: validateOrReset(
        currentSaved?.trading?.enableChartMarks,
        DEFAULT_USER_STATE.trading.enableChartMarks,
        tradingSchema.shape.enableChartMarks,
      ),
      enableQuickMarketClose: validateOrReset(
        currentSaved?.trading?.enableQuickMarketClose,
        DEFAULT_USER_STATE.trading.enableQuickMarketClose,
        tradingSchema.shape.enableQuickMarketClose,
      ),
      tradingTableTabFilters: validateOrReset(
        currentSaved?.trading?.tradingTableTabFilters,
        DEFAULT_USER_STATE.trading.tradingTableTabFilters,
        tradingSchema.shape.tradingTableTabFilters,
      ),
      lastSelectedSpotMarketId: validateOrReset(
        currentSaved?.trading?.lastSelectedSpotMarketId,
        DEFAULT_USER_STATE.trading.lastSelectedSpotMarketId,
        tradingSchema.shape.lastSelectedSpotMarketId,
      ),
      lastSelectedPerpMarketId: validateOrReset(
        currentSaved?.trading?.lastSelectedPerpMarketId,
        DEFAULT_USER_STATE.trading.lastSelectedPerpMarketId,
        tradingSchema.shape.lastSelectedPerpMarketId,
      ),
      lastSelectedEngineOrderType: validateOrReset(
        currentSaved?.trading?.lastSelectedEngineOrderType,
        DEFAULT_USER_STATE.trading.lastSelectedEngineOrderType,
        tradingSchema.shape.lastSelectedEngineOrderType,
      ),
      lastSelectedSizeDenom: validateOrReset(
        currentSaved?.trading?.lastSelectedSizeDenom,
        DEFAULT_USER_STATE.trading.lastSelectedSizeDenom,
        tradingSchema.shape.lastSelectedSizeDenom,
      ),
      lastSelectedSide: validateOrReset(
        currentSaved?.trading?.lastSelectedSide,
        DEFAULT_USER_STATE.trading.lastSelectedSide,
        tradingSchema.shape.lastSelectedSide,
      ),
    },
    tables: validateOrReset(
      currentSaved?.tables,
      DEFAULT_USER_STATE.tables,
      userStateSchema.shape.tables,
    ),
  };

  return cloneDeep(withDefaults);
}
