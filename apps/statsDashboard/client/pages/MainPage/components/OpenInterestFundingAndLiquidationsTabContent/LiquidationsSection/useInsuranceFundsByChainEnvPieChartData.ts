import { ChainEnv, removeDecimals } from '@nadohq/client';
import { getChainEnvName } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useQueryEdgeInsuranceFunds } from 'client/hooks/query/useQueryEdgeInsuranceFunds';
import { sumBy } from 'lodash';
import { useMemo } from 'react';

export function useInsuranceFundsByChainEnvPieChartData() {
  const {
    data: edgeInsuranceFundsData,
    isLoading: isLoadingInsuranceFundsData,
  } = useQueryEdgeInsuranceFunds();

  const mappedData = useMemo(() => {
    if (!edgeInsuranceFundsData) {
      return;
    }

    const insuranceFundsByChainEnvUsd = Object.entries(edgeInsuranceFundsData)
      .map(([chainEnv, insuranceFunds]) => {
        const insuranceFundsUsd = removeDecimals(insuranceFunds);

        if (!insuranceFundsUsd) {
          return;
        }

        return {
          name: getChainEnvName(chainEnv as ChainEnv),
          value: insuranceFundsUsd.toNumber(),
        };
      })
      .filter(nonNullFilter);

    const edgeTotalInsuranceFundsUsd = sumBy(
      insuranceFundsByChainEnvUsd,
      ({ value }) => value,
    );

    return { edgeTotalInsuranceFundsUsd, insuranceFundsByChainEnvUsd };
  }, [edgeInsuranceFundsData]);

  return { data: mappedData, isLoading: isLoadingInsuranceFundsData };
}
