import { SavedUserState } from 'client/modules/localstorage/userState/types/SavedUserState';
import { Address } from 'viem';

type SessionUserState = Pick<
  SavedUserState,
  'signingPreferenceBySubaccountKey' | 'selectedSubaccountNameByChainEnv'
>;

/**
 * Defines the structure of data included in a desktop wallet connection link.
 * This data enables session restoration and wallet pairing on mobile devices.
 */
export interface DesktopWalletLinkData {
  /** Wallet address to link. */
  address: Address;
  /** Subset of user state required for session context. */
  sessionUserState: SessionUserState;
}
