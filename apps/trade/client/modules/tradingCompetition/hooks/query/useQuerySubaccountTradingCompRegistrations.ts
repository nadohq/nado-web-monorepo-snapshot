import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { ALL_TRADING_COMP_CONTEST_IDS } from 'client/modules/tradingCompetition/consts';

export function subaccountTradingCompRegistrationsQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
) {
  return createQueryKey(
    'subaccountTradingCompRegistrations',
    chainEnv,
    subaccountOwner,
    subaccountName,
  );
}

export function useQuerySubaccountTradingCompRegistrations() {
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
    queryKey: subaccountTradingCompRegistrationsQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const response =
        await nadoClient.context.indexerClient.getLeaderboardRegistrations({
          subaccount: {
            subaccountOwner,
            subaccountName,
          },
          contestIds: ALL_TRADING_COMP_CONTEST_IDS,
        });

      return response;
    },
    enabled: !disabled,
    refetchInterval: 30000,
  });
}
