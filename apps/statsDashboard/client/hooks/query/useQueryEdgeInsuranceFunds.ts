import { ChainEnv } from '@nadohq/client';
import {
  createQueryKey,
  getRecordKeyedByChainEnvWithEdge,
  QueryDisabledError,
  useNadoClientContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';

export function useQueryEdgeInsuranceFunds() {
  const { nadoClientsByChainEnv } = useNadoClientContext();
  const disabled = !nadoClientsByChainEnv;

  return useQuery({
    queryKey: createQueryKey('insuranceFunds'),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const insuranceByChainEnv: Record<ChainEnv, BigNumber | undefined> =
        getRecordKeyedByChainEnvWithEdge(undefined);

      const insuranceFundsPromises = Object.values(nadoClientsByChainEnv).map(
        async ({ chainEnv, client }) => {
          const insurance = await client.context.engineClient.getInsurance();

          return {
            chainEnv,
            insurance,
          };
        },
      );

      const insuranceFundsResults = await Promise.all(insuranceFundsPromises);

      insuranceFundsResults.forEach(({ chainEnv, insurance }) => {
        insuranceByChainEnv[chainEnv] = insurance;
      });

      return insuranceByChainEnv;
    },
    enabled: !disabled,
  });
}
