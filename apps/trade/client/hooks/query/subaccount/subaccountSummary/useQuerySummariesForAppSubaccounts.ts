import { ChainEnv, SubaccountSummaryState } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useNadoMetadataContext,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { annotateSubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/annotateSubaccountSummary';
import { subaccountSummaryQueryKey } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';

export function summariesForAppSubaccountsQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountNames?: string[],
) {
  return createQueryKey(
    'summariesForAppSubaccounts',
    chainEnv,
    subaccountOwner,
    subaccountNames,
  );
}

/**
 * Returns all subaccount summaries associated with app subaccounts (excludes API subaccounts)
 */
export function useQuerySummariesForAppSubaccounts() {
  const queryClient = useQueryClient();
  const nadoClient = usePrimaryChainNadoClient();
  const {
    currentSubaccount: { address, chainEnv },
    appSubaccountNames,
  } = useSubaccountContext();
  const { getPerpMetadata, getSpotMetadata } = useNadoMetadataContext();

  const disabled = !nadoClient || !address || !appSubaccountNames;

  return useQuery({
    queryKey: summariesForAppSubaccountsQueryKey(
      chainEnv,
      address,
      appSubaccountNames,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const summaries = await Promise.all(
        appSubaccountNames.map((name) =>
          nadoClient.subaccount.getSubaccountSummary({
            subaccountName: name,
            subaccountOwner: address,
          }),
        ),
      );

      const summariesBySubaccountName: Record<string, SubaccountSummaryState> =
        {};

      summaries.forEach((summary, i) => {
        const subaccountName = appSubaccountNames[i];

        const annotatedSummary = annotateSubaccountSummary({
          summary,
          getPerpMetadata,
          getSpotMetadata,
        });

        // Since we have all subaccount summaries here, we can manually update the cache.
        queryClient.setQueryData(
          subaccountSummaryQueryKey(chainEnv, address, subaccountName),
          annotatedSummary,
        );

        summariesBySubaccountName[subaccountName] = annotatedSummary;
      });

      return summariesBySubaccountName;
    },
    enabled: !disabled,
    // This query is expensive, so we don't refetch on a set interval
    refetchInterval: false,
  });
}
