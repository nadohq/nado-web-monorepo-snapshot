import { Fuul, UserIdentifierType } from '@fuul/sdk';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateQueries } from 'client/hooks/execute/util/useUpdateQueries';
import { addressFuulReferralCodeQueryKey } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralCode';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const UPDATE_QUERY_KEYS = [
  // This is used to update the list of referees under the referral code
  addressFuulReferralCodeQueryKey(),
];

export function useExecuteDeleteFuulReferee() {
  const { t } = useTranslation();

  const updateQueries = useUpdateQueries(UPDATE_QUERY_KEYS);

  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: { referralCode: string; refereeAddress: string },
        context: ValidExecuteContext,
      ) => {
        console.log('Delete Fuul Referee', params);

        // Failsafe check: Verify the referee has no subaccounts
        const subaccounts =
          await context.nadoClient.context.indexerClient.listSubaccounts({
            address: params.refereeAddress,
            limit: 1,
          });

        if (subaccounts.length > 0) {
          throw new Error(t(($) => $.errors.deleteReferralActiveAccount));
        }

        const message = `I am deleting referral for user ${params.refereeAddress} from code ${params.referralCode}`;
        const signature = await context.walletClient.signMessage({ message });

        return Fuul.deleteReferral({
          code: params.referralCode,
          user_identifier: params.refereeAddress,
          user_identifier_type: UserIdentifierType.EvmAddress,
          referrer_identifier: context.subaccount.address,
          referrer_identifier_type: UserIdentifierType.EvmAddress,
          signature,
          signature_message: message,
          chain_id: context.walletClient.chain.id,
        });
      },
      [t],
    ),
  );

  return useMutation({
    mutationFn,
    onSuccess() {
      updateQueries();
    },
    onError(error, variables) {
      logExecuteError('DeleteFuulReferee', error, variables);
    },
  });
}
