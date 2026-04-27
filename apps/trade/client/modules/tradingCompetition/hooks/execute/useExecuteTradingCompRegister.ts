import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateQueries } from 'client/hooks/execute/util/useUpdateQueries';
import { subaccountTradingCompParticipantQueryKey } from 'client/modules/tradingCompetition/hooks/query/useQuerySubaccountTradingCompParticipant';
import { subaccountTradingCompRegistrationsQueryKey } from 'client/modules/tradingCompetition/hooks/query/useQuerySubaccountTradingCompRegistrations';
import { useCallback } from 'react';

interface Params {
  contestIds: number[];
}

const UPDATE_QUERY_KEYS = [
  subaccountTradingCompRegistrationsQueryKey(),
  subaccountTradingCompParticipantQueryKey(),
];

export function useExecuteTradingCompRegister() {
  const updateQueries = useUpdateQueries(UPDATE_QUERY_KEYS);

  const mutationFn = useExecuteInValidContext(
    useCallback(async (params: Params, context: ValidExecuteContext) => {
      const response =
        await context.nadoClient.context.indexerClient.registerLeaderboard({
          subaccountOwner: context.subaccount.address,
          subaccountName: context.subaccount.name,
          contestIds: params.contestIds,
          verifyingAddr: context.nadoClient.context.contractAddresses.endpoint,
          chainId: context.subaccount.chainId,
        });

      return response;
    }, []),
  );

  return useMutation({
    mutationFn,
    onSuccess() {
      updateQueries();
    },
    onError(error, variables) {
      logExecuteError('TradingCompRegister', error, variables);
    },
  });
}
