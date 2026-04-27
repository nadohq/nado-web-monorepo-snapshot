import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { ALL_TRADING_COMP_CONTEST_IDS } from 'client/modules/tradingCompetition/consts';

export function subaccountTradingCompParticipantQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
) {
  return createQueryKey(
    'subaccountTradingCompParticipant',
    chainEnv,
    subaccountOwner,
    subaccountName,
  );
}

export function useQuerySubaccountTradingCompParticipant() {
  const nadoClient = usePrimaryChainNadoClient();
  const {
    currentSubaccount: {
      address: subaccountOwner,
      name: subaccountName,
      chainEnv,
    },
  } = useSubaccountContext();

  const disabled = !nadoClient || !subaccountOwner;

  return useQuery({
    queryKey: subaccountTradingCompParticipantQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const response =
        await nadoClient.context.indexerClient.getLeaderboardParticipant({
          contestIds: ALL_TRADING_COMP_CONTEST_IDS,
          subaccount: {
            subaccountOwner,
            subaccountName,
          },
        });

      return response;
    },
    enabled: !disabled,
    refetchInterval: 30000,
  });
}
