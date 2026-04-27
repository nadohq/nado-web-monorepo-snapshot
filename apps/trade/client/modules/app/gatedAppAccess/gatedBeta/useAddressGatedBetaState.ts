import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useSavedGlobalState } from 'client/modules/localstorage/globalState/useSavedGlobalState';
import { useQueryAddressFuulReferralStatus } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralStatus';
import { clientEnv } from 'common/environment/clientEnv';

type AddressGatedBetaState = 'access_allowed' | 'access_denied' | 'loading';

export function useAddressGatedBetaState(): AddressGatedBetaState {
  const isConnected = useIsConnected();
  const { savedGlobalState } = useSavedGlobalState();
  const { data: referralStatus } = useQueryAddressFuulReferralStatus();
  const isBypassed = savedGlobalState?.betaGatingBypass;

  const isAllowedAccess =
    isBypassed || !clientEnv.base.enableBetaGating || referralStatus?.referred;

  if (isAllowedAccess) {
    return 'access_allowed';
  }
  if (isConnected && referralStatus === undefined) {
    return 'loading';
  }
  return 'access_denied';
}
