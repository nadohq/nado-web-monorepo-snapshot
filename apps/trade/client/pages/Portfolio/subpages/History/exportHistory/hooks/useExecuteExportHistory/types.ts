import { SubaccountProfile } from '@nadohq/react-client';
import { ValidExecuteContext } from 'client/hooks/execute/util/useExecuteInValidContext';
import { AllMarketsStaticDataForChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import type { TFunction } from 'i18next';

/**
 * Context for export history util functions. Provides any necessary data to map historical events to expected export format.
 */
export interface GetExportHistoryDataContext extends Pick<
  ValidExecuteContext,
  'nadoClient' | 'subaccount'
> {
  allMarketsStaticData: AllMarketsStaticDataForChainEnv;
  getSubaccountProfile: (subaccountName: string) => SubaccountProfile;
  setProgressFrac: (frac: number) => void;
  t: TFunction;
}
