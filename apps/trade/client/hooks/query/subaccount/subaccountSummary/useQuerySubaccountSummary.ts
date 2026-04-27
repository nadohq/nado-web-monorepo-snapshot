import { ChainEnv, GetEngineSubaccountSummaryParams } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useNadoMetadataContext,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { NOT_CONNECTED_ALT_QUERY_ADDRESS } from 'client/hooks/query/consts/notConnectedAltQueryAddress';
import {
  AnnotatedSubaccountSummary,
  annotateSubaccountSummary,
} from 'client/hooks/query/subaccount/subaccountSummary/annotateSubaccountSummary';
import { useOperationTimeLogger } from 'client/hooks/util/useOperationTimeLogger';

export function subaccountSummaryQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
) {
  return createQueryKey(
    'subaccountSummary',
    chainEnv,
    subaccountOwner,
    subaccountName,
  );
}

export function useQuerySubaccountSummary({
  subaccountName,
}: {
  subaccountName?: string;
} = {}) {
  const { startProfiling, endProfiling } = useOperationTimeLogger(
    'subaccountSummary',
    true,
  );
  const nadoClient = usePrimaryChainNadoClient();

  const { currentSubaccount } = useSubaccountContext();
  const { address: subaccountOwner } = currentSubaccount;
  const targetSubaccountName = subaccountName ?? currentSubaccount.name;

  const { getPerpMetadata, getSpotMetadata } = useNadoMetadataContext();

  const disabled = !nadoClient;

  const subaccountOwnerForQuery =
    subaccountOwner ?? NOT_CONNECTED_ALT_QUERY_ADDRESS;
  const isConnected = !!subaccountOwner;

  const queryFn = async (): Promise<
    AnnotatedSubaccountSummary & { exists: boolean }
  > => {
    if (disabled) {
      throw new QueryDisabledError();
    }
    const params: GetEngineSubaccountSummaryParams = {
      subaccountOwner: subaccountOwnerForQuery,
      subaccountName: targetSubaccountName,
    };

    startProfiling();
    const baseResponse =
      await nadoClient.subaccount.getSubaccountSummary(params);
    endProfiling();

    return {
      ...annotateSubaccountSummary({
        summary: baseResponse,
        getSpotMetadata,
        getPerpMetadata,
      }),
      exists: baseResponse.exists,
    };
  };

  return useQuery({
    queryKey: subaccountSummaryQueryKey(
      currentSubaccount.chainEnv,
      subaccountOwnerForQuery,
      targetSubaccountName,
    ),
    queryFn,
    enabled: !disabled,
    // Refetches are handled by WS event listeners when the subaccount exists
    refetchInterval: (query) => {
      if (query.state.data?.exists || !isConnected) {
        return false;
      }
      // Pick up newly created subaccounts by polling every 5 seconds if the subaccount doesn't exist yet
      return 5000;
    },
  });
}
