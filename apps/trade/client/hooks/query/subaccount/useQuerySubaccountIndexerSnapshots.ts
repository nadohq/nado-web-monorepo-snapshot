import {
  ChainEnv,
  GetIndexerMultiSubaccountSnapshotsParams,
  IndexerSubaccountSnapshot,
} from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useQuery } from '@tanstack/react-query';
import { NOT_CONNECTED_ALT_QUERY_ADDRESS } from 'client/hooks/query/consts/notConnectedAltQueryAddress';
import { useGetNowTimeInSeconds } from 'client/hooks/util/useGetNowTime';
import { useOperationTimeLogger } from 'client/hooks/util/useOperationTimeLogger';
import { get } from 'lodash';

export function subaccountIndexerSnapshotsQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
  secondsBeforeNow?: number[],
) {
  return createQueryKey(
    'subaccountIndexerSnapshots',
    chainEnv,
    subaccountOwner,
    subaccountName,
    secondsBeforeNow,
  );
}

type Data = IndexerSubaccountSnapshot[];

interface Params<TSelectedData> {
  secondsBeforeNow?: number[];
  select?: (data: Data) => TSelectedData;
}

/**
 * Historical subaccount snapshots for multiple points in time
 */
export function useQuerySubaccountIndexerSnapshots<TSelectedData = Data>({
  secondsBeforeNow,
  select,
}: Params<TSelectedData>) {
  const { startProfiling, endProfiling } = useOperationTimeLogger(
    'subaccountIndexerSnapshots',
    true,
  );
  const {
    currentSubaccount: {
      name: subaccountName,
      address: subaccountOwner,
      chainEnv,
    },
  } = useSubaccountContext();
  const nadoClient = usePrimaryChainNadoClient();
  const getNowTimeInSeconds = useGetNowTimeInSeconds();

  // If no current subaccount, query for a subaccount that does not exist to ensure that we have data
  const subaccountOwnerForQuery =
    subaccountOwner ?? NOT_CONNECTED_ALT_QUERY_ADDRESS;
  const isConnected = !!subaccountOwner;

  const disabled = !nadoClient || !secondsBeforeNow?.length;

  const queryFn = async () => {
    if (disabled) {
      throw new QueryDisabledError();
    }
    const nowTime = getNowTimeInSeconds();
    const timestamps = secondsBeforeNow.map((seconds) => nowTime - seconds);
    const params: GetIndexerMultiSubaccountSnapshotsParams = {
      subaccounts: [
        {
          subaccountOwner: subaccountOwnerForQuery,
          subaccountName,
        },
      ],
      timestamps,
    };

    startProfiling();
    const response =
      await nadoClient.context.indexerClient.getMultiSubaccountSnapshots(
        params,
      );
    endProfiling();

    // We have the invariant that we always query for 1 subaccount, so this is safe
    const subaccountHexId = response.subaccountHexIds[0];
    const snapshotsForSubaccount = get(
      response.snapshots,
      subaccountHexId,
      undefined,
    );

    // Return an array of balance snapshots in the same order as the timestamps
    // If backend is correct, then the nonNullFilter should never be hit
    return timestamps
      .map((timestamp) => snapshotsForSubaccount?.[timestamp])
      .filter(nonNullFilter);
  };

  return useQuery({
    queryKey: subaccountIndexerSnapshotsQueryKey(
      chainEnv,
      subaccountOwnerForQuery,
      subaccountName,
      secondsBeforeNow,
    ),
    queryFn,
    enabled: !disabled,
    select,
    // Refetch-after-event is not super reliable for this query since it relies on the indexer processing new events and updating snapshots in a timely manner, so we use a short refetch interval to ensure data is updated reasonably quickly
    refetchInterval: isConnected ? 5000 : false,
  });
}
