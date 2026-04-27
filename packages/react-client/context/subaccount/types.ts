import { AccountWithPrivateKey, ChainEnv } from '@nadohq/client';
import { PrimaryChainID } from '../../types';

export interface SubaccountSignOncePreference {
  type: 'sign_once';
  linkedSigner: AccountWithPrivateKey | undefined;
  savePrivateKey: boolean;
}

export interface SubaccountSignAlwaysPreference {
  type: 'sign_always';
  linkedSigner?: never;
  savePrivateKey?: never;
}

export type SubaccountSigningPreference =
  | SubaccountSignOncePreference
  | SubaccountSignAlwaysPreference;

export type SubaccountSigningPreferenceType =
  SubaccountSigningPreference['type'];

type SavedSubaccountSignOncePreference = Omit<
  SubaccountSignOncePreference,
  'linkedSigner'
> & {
  // Can be undefined if "Remember Approval" was enabled or if local storage was changed
  privateKey?: string;
};

export type SavedSubaccountSigningPreference =
  | SavedSubaccountSignOncePreference
  | SubaccountSignAlwaysPreference;

export type SavedSigningPreferenceBySubaccountKey = Record<
  string,
  SavedSubaccountSigningPreference
>;

export interface AppSubaccount {
  name: string;
  chainEnv: ChainEnv;
  chainId: PrimaryChainID;
  // Not defined if not connected
  address?: string;
}

export type UpdateSigningPreferenceFn = (
  newVal: SubaccountSigningPreference,
) => void;
