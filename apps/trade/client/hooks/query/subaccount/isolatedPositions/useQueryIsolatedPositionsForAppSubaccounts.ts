import { ChainEnv, SubaccountIsolatedPosition } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useNadoMetadataContext,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { annotateIsolatedPositions } from 'client/hooks/query/subaccount/isolatedPositions/annotateIsolatedPositions';
import { subaccountIsolatedPositionsQueryKey } from 'client/hooks/query/subaccount/isolatedPositions/useQuerySubaccountIsolatedPositions';

export function isolatedPositionsForAppSubaccountsQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountNames?: string[],
) {
  return createQueryKey(
    'isolatedPositionForAppSubaccounts',
    chainEnv,
    subaccountOwner,
    subaccountNames,
  );
}

/**
 * Returns all isolated positions for all app subaccounts (excludes API subaccounts)
 */
export function useQueryIsolatedPositionsForAppSubaccounts() {
  const queryClient = useQueryClient();
  const nadoClient = usePrimaryChainNadoClient();
  const {
    currentSubaccount: { address, chainEnv },
    appSubaccountNames,
  } = useSubaccountContext();
  const { getPerpMetadata, getSpotMetadata } = useNadoMetadataContext();

  const disabled = !nadoClient || !address || !appSubaccountNames;

  return useQuery({
    queryKey: isolatedPositionsForAppSubaccountsQueryKey(
      chainEnv,
      address,
      appSubaccountNames,
    ),
    queryFn: async () => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const allIsolatedPositions = await Promise.all(
        appSubaccountNames.map((name) =>
          nadoClient.subaccount.getIsolatedPositions({
            subaccountName: name,
            subaccountOwner: address,
          }),
        ),
      );

      const positionsBySubaccountName: Record<
        string,
        SubaccountIsolatedPosition[]
      > = {};

      allIsolatedPositions.forEach((positions, i) => {
        const subaccountName = appSubaccountNames[i];

        const annotatedPositions = annotateIsolatedPositions({
          isolatedPositions: positions,
          getPerpMetadata,
          getSpotMetadata,
        });

        // Since we have all subaccount summaries here, we can manually update the cache.
        queryClient.setQueryData(
          subaccountIsolatedPositionsQueryKey(
            chainEnv,
            address,
            subaccountName,
          ),
          annotatedPositions,
        );

        positionsBySubaccountName[subaccountName] = annotatedPositions;
      });

      return positionsBySubaccountName;
    },
    enabled: !disabled,
    // This query is expensive, so we don't refetch on a set interval
    refetchInterval: false,
  });
}
