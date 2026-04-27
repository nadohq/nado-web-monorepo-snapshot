import { Fuul, UserIdentifierType } from '@fuul/sdk';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateQueries } from 'client/hooks/execute/util/useUpdateQueries';
import { addressFuulReferralStatusQueryKey } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralStatus';
import { fuulReferralCodeStatusQueryKey } from 'client/modules/referrals/hooks/query/useQueryFuulReferralCodeStatus';
import { useCallback } from 'react';

const UPDATE_QUERY_KEYS = [
  addressFuulReferralStatusQueryKey(),
  fuulReferralCodeStatusQueryKey(),
];

interface Params {
  onSuccess?: () => void;
}

export function useExecuteUseFuulReferralCode({ onSuccess }: Params) {
  const updateQueries = useUpdateQueries(UPDATE_QUERY_KEYS);

  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: { referralCode: string },
        context: ValidExecuteContext,
      ) => {
        console.log('Use Referral Code', params);
        const message = `I am using referral code ${params.referralCode}`;

        const signature = await context.walletClient.signMessage({ message });
        // This rename prevents an ESLint error for hooks (because of the `use` prefix)
        const fuulMutationFn = Fuul.useReferralCode;

        return fuulMutationFn({
          code: params.referralCode,
          user_identifier: context.subaccount.address,
          user_identifier_type: UserIdentifierType.EvmAddress,
          signature,
          signature_message: message,
          account_chain_id: context.walletClient.chain.id,
        });
      },
      [],
    ),
  );

  return useMutation({
    mutationFn,
    onSuccess() {
      updateQueries();
      onSuccess?.();
    },
    onError(error, variables) {
      logExecuteError('UseFuulReferralCode', error, variables);
    },
  });
}
