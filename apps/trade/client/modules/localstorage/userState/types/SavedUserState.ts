import { ChainEnv } from '@nadohq/client';
import {
  SavedSigningPreferenceBySubaccountKey,
  SubaccountProfile,
} from '@nadohq/react-client';
import { TableSettings } from 'client/modules/localstorage/userState/types/tableSettings';
import {
  NotificationPosition,
  SavedTradingUserSettings,
} from 'client/modules/localstorage/userState/types/tradingSettings';
import { UserDisclosureKey } from 'client/modules/localstorage/userState/types/userDisclosureTypes';
import { FundingRatePeriod } from 'client/modules/localstorage/userState/types/userFundingRatePeriodTypes';
import { UserTutorialFlowState } from 'client/modules/localstorage/userState/types/userTutorialFlowTypes';
import { PrivacySettings } from 'client/modules/privacy/types';

export interface SavedUserState {
  /** Whether the user has completed the onboarding process */
  onboardingComplete: boolean;
  /** The keys of the disclosures that the user has dismissed */
  dismissedDisclosures: UserDisclosureKey[];
  /** The user's tutorial flow state */
  tutorial: UserTutorialFlowState;
  /** The user's funding rate period */
  fundingRatePeriod: FundingRatePeriod;
  /** The user's trading settings */
  trading: SavedTradingUserSettings;
  /** The user's notification position */
  notificationPosition: NotificationPosition;
  /** The user's privacy settings */
  privacy: PrivacySettings;
  /** The user's signing preference by subaccount key */
  signingPreferenceBySubaccountKey: SavedSigningPreferenceBySubaccountKey;
  /** The user's profile by subaccount key */
  profileBySubaccountKey: Record<string, SubaccountProfile | undefined>;
  /** The user's selected subaccount name by chain environment */
  selectedSubaccountNameByChainEnv: Partial<Record<ChainEnv, string>>;
  /** The user's table settings */
  tables: TableSettings;
}
