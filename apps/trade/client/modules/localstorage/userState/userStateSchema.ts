import { ALL_CHAIN_ENVS } from '@nadohq/client';
import {
  DEFAULT_SUBACCOUNT_AVATAR,
  SubaccountProfile,
} from '@nadohq/react-client';
import { SavedUserState } from 'client/modules/localstorage/userState/types/SavedUserState';
import { TableSettings } from 'client/modules/localstorage/userState/types/tableSettings';
import {
  BALANCE_SIDES,
  LAST_SELECTED_ENGINE_ORDER_TYPES,
  MARGIN_MODES_TYPES,
  MarginModeSettings,
  NOTIFICATION_POSITIONS,
  OrderSlippageSettings,
  SavedTradingUserSettings,
  TRADING_CONSOLE_POSITIONS,
  TpSlTriggerPriceTypeSettings,
} from 'client/modules/localstorage/userState/types/tradingSettings';
import { FUNDING_RATE_PERIODS } from 'client/modules/localstorage/userState/types/userFundingRatePeriodTypes';
import { USER_TUTORIAL_FLOW_STEP_IDS } from 'client/modules/localstorage/userState/types/userTutorialFlowTypes';
import { isValidProfileAvatar } from 'client/modules/localstorage/userState/userStateValidators';
import {
  zodNumericEnum,
  zodNumericObjectKey,
} from 'client/modules/localstorage/utils/zodValidators';
import { PrivacySettings } from 'client/modules/privacy/types';
import { PERP_POSITIONS_DEFAULT_COLUMN_ORDER } from 'client/modules/tables/customizableTables/tableConfigs/perpPositions';
import { ORDERBOOK_PRICE_TICK_SPACING_MULTIPLIERS } from 'client/modules/trading/marketOrders/orderbook/types';
import { ORDER_FORM_SIZE_DENOMS } from 'client/modules/trading/types/orderFormTypes';
import { TRIGGER_REFERENCE_PRICE_TYPES } from 'client/modules/trading/types/TriggerReferencePriceType';
import { isObject, isString } from 'lodash';
import { z } from 'zod';

/**
 * Make dismissedDisclosures array more general so that removal of obsolete dismiss keys doesn't invalidate entire array
 */
interface UserStateSchema extends Omit<SavedUserState, 'dismissedDisclosures'> {
  dismissedDisclosures: string[];
}

function isSubaccountProfile(data: unknown): data is SubaccountProfile {
  return isObject(data) && 'username' in data && isString(data.username);
}

const profileSchema = z
  .custom<SubaccountProfile>(isSubaccountProfile)
  .transform((data) =>
    isValidProfileAvatar(data.avatar)
      ? data
      : {
          ...data,
          avatar: DEFAULT_SUBACCOUNT_AVATAR,
        },
  );

const subaccountSigningPreferenceSchema = z.union([
  z.object({
    type: z.literal('sign_always'),
  }),
  z.object({
    type: z.literal('sign_once'),
    savePrivateKey: z.boolean(),
    privateKey: z.string().optional(),
  }),
]);

const slippageSchema = z.object({
  market: z.number(),
  stopMarket: z.number(),
  takeProfit: z.number(),
  stopLoss: z.number(),
}) satisfies z.ZodType<OrderSlippageSettings>;

const marginModeSchema = z.object({
  default: z.enum(MARGIN_MODES_TYPES),
  lastSelected: z.record(
    zodNumericObjectKey(),
    z.union([
      z.object({
        mode: z.literal('isolated'),
        leverage: z.number(),
        enableBorrows: z.boolean(),
      }),
      z.object({
        mode: z.literal('cross'),
        leverage: z.number(),
      }),
    ]),
  ),
}) satisfies z.ZodType<MarginModeSettings>;

export const userStateSchema = z.object({
  onboardingComplete: z.boolean(),
  dismissedDisclosures: z.array(z.string()),
  tutorial: z.object({
    isDismissed: z.boolean(),
    completedSteps: z.array(z.enum(USER_TUTORIAL_FLOW_STEP_IDS)),
  }),
  fundingRatePeriod: z.enum(FUNDING_RATE_PERIODS),
  notificationPosition: z.enum(NOTIFICATION_POSITIONS),
  privacy: z.object({
    areAccountValuesPrivate: z.boolean(),
    isAddressPrivate: z.boolean(),
  }) satisfies z.ZodType<PrivacySettings>,
  profileBySubaccountKey: z.record(z.string(), profileSchema),
  selectedSubaccountNameByChainEnv: z.partialRecord(
    z.enum(ALL_CHAIN_ENVS),
    z.string(),
  ),
  signingPreferenceBySubaccountKey: z.record(
    z.string(),
    subaccountSigningPreferenceSchema,
  ),
  trading: z.object({
    consolePosition: z.enum(TRADING_CONSOLE_POSITIONS),
    favoriteMarketIds: z.array(z.number()),
    leverageByProductId: z.record(zodNumericObjectKey(), z.number()),
    marginMode: marginModeSchema,
    orderbookTickSpacingMultiplierByProductId: z.record(
      zodNumericObjectKey(),
      zodNumericEnum(ORDERBOOK_PRICE_TICK_SPACING_MULTIPLIERS),
    ),
    showOrderbookTotalInQuote: z.boolean(),
    spotLeverageEnabled: z.boolean(),
    slippage: slippageSchema,
    tpSlTriggerPriceType: z.object({
      takeProfit: z.enum(TRIGGER_REFERENCE_PRICE_TYPES),
      stopLoss: z.enum(TRIGGER_REFERENCE_PRICE_TYPES),
    }) satisfies z.ZodType<TpSlTriggerPriceTypeSettings>,
    enableTradingNotifications: z.boolean(),
    enableTradingOrderLines: z.boolean(),
    enableTradingPositionLines: z.boolean(),
    enableTradingOrderbookAnimations: z.boolean(),
    enableChartMarks: z.boolean(),
    enableQuickMarketClose: z.boolean(),
    tradingTableTabFilters: z.object({
      showAllMarkets: z.boolean(),
      hideSmallBalances: z.boolean(),
    }),
    lastSelectedSpotMarketId: z.union([z.number(), z.undefined()]),
    lastSelectedPerpMarketId: z.union([z.number(), z.undefined()]),
    lastSelectedEngineOrderType: z.enum(LAST_SELECTED_ENGINE_ORDER_TYPES),
    lastSelectedSizeDenom: z.enum(ORDER_FORM_SIZE_DENOMS),
    lastSelectedSide: z.enum(BALANCE_SIDES),
  }) satisfies z.ZodType<SavedTradingUserSettings>,
  tables: z.object({
    perpPositions: z.object({
      columnVisibility: z.union([
        z.partialRecord(
          z.enum(PERP_POSITIONS_DEFAULT_COLUMN_ORDER),
          z.boolean(),
        ),
        z.undefined(),
      ]),
      columnOrder: z.union([
        z.array(z.enum(PERP_POSITIONS_DEFAULT_COLUMN_ORDER)),
        z.undefined(),
      ]),
    }),
  }) satisfies z.ZodType<TableSettings>,
}) satisfies z.ZodType<UserStateSchema>;
