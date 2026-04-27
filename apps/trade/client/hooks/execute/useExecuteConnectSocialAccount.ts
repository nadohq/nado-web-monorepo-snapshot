import type { ConnectSocialAccountParams } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateQueries } from 'client/hooks/execute/util/useUpdateQueries';
import { linkedSocialAccountsQueryKey } from 'client/hooks/query/social/useQueryLinkedSocialAccounts';
import { useCallback } from 'react';

type Params = Pick<ConnectSocialAccountParams, 'provider'>;

const UPDATE_QUERY_KEYS = [linkedSocialAccountsQueryKey()];

export function useExecuteConnectSocialAccount() {
  const updateQueries = useUpdateQueries(UPDATE_QUERY_KEYS);

  const mutationFn = useExecuteInValidContext(
    useCallback(async (params: Params, context: ValidExecuteContext) => {
      const { contractAddresses } = context.nadoClient.context;

      return context.nadoClient.context.indexerClient.connectSocialAccount({
        subaccountOwner: context.subaccount.address,
        subaccountName: context.subaccount.name,
        verifyingAddr: contractAddresses.endpoint,
        chainId: context.subaccount.chainId,
        ...params,
      });
    }, []),
  );

  return useMutation({
    mutationFn,
    onSuccess() {
      updateQueries();
    },
    onError(error, variables) {
      logExecuteError('ConnectSocialAccount', error, variables);
    },
  });
}
