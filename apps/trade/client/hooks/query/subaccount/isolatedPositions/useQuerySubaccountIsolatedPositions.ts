import { ChainEnv, GetEngineSubaccountSummaryParams } from '@nadohq/client';
import {
  AnnotatedIsolatedPositionWithProduct,
  createQueryKey,
  QueryDisabledError,
  useNadoMetadataContext,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { NOT_CONNECTED_ALT_QUERY_ADDRESS } from 'client/hooks/query/consts/notConnectedAltQueryAddress';
import { annotateIsolatedPositions } from 'client/hooks/query/subaccount/isolatedPositions/annotateIsolatedPositions';

export function subaccountIsolatedPositionsQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
) {
  return createQueryKey(
    'subaccountIsolatedPositions',
    chainEnv,
    subaccountOwner,
    subaccountName,
  );
}

export function useQuerySubaccountIsolatedPositions() {
  const nadoClient = usePrimaryChainNadoClient();

  const { getSpotMetadata, getPerpMetadata } = useNadoMetadataContext();
  const { currentSubaccount } = useSubaccountContext();
  const { address: subaccountOwner, name: subaccountName } = currentSubaccount;

  const disabled = !nadoClient;

  const subaccountOwnerForQuery =
    subaccountOwner ?? NOT_CONNECTED_ALT_QUERY_ADDRESS;

  const queryFn = async (): Promise<AnnotatedIsolatedPositionWithProduct[]> => {
    if (disabled) {
      throw new QueryDisabledError();
    }
    const params: GetEngineSubaccountSummaryParams = {
      subaccountOwner: subaccountOwnerForQuery,
      subaccountName,
    };

    const baseResponse =
      await nadoClient.subaccount.getIsolatedPositions(params);

    return annotateIsolatedPositions({
      isolatedPositions: baseResponse,
      getSpotMetadata,
      getPerpMetadata,
    });
  };

  return useQuery({
    queryKey: subaccountIsolatedPositionsQueryKey(
      currentSubaccount.chainEnv,
      subaccountOwnerForQuery,
      subaccountName,
    ),
    queryFn,
    enabled: !disabled,
    // Refetches are handled by WS event listeners
  });
}
