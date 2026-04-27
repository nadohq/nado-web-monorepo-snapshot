import { ChainEnv, SubaccountTx } from '@nadohq/client';
import {
  createQueryKey,
  QueryDisabledError,
  useNadoMetadataContext,
  usePrimaryChainNadoClient,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'ahooks';
import {
  AnnotatedSubaccountSummary,
  annotateSubaccountSummary,
} from 'client/hooks/query/subaccount/subaccountSummary/annotateSubaccountSummary';

export interface EstimateSubaccountStateChangeParams {
  estimateStateTxs: SubaccountTx[];
  subaccountName?: string;
}

export function subaccountEstimatedSummaryQueryKey(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
  estimateStateTxs?: SubaccountTx[],
) {
  return createQueryKey(
    'subaccountEstimatedSummary',
    chainEnv,
    subaccountOwner,
    subaccountName,
    estimateStateTxs,
  );
}

/**
 * Given a set of proposed transactions, return the estimated subaccount state after applying deltas
 */
export function useQuerySubaccountEstimatedSummary({
  estimateStateTxs,
  subaccountName,
}: EstimateSubaccountStateChangeParams) {
  const nadoClient = usePrimaryChainNadoClient();

  const { currentSubaccount } = useSubaccountContext();
  const { address: subaccountOwner } = currentSubaccount;
  const targetSubaccountName = subaccountName ?? currentSubaccount.name;
  const { getPerpMetadata, getSpotMetadata } = useNadoMetadataContext();

  // Force a debounce here as usages will all come from user input
  const debouncedTxs = useDebounce(estimateStateTxs, { wait: 500 });
  const disabled = !nadoClient || !debouncedTxs.length || !subaccountOwner;

  return useQuery({
    queryKey: subaccountEstimatedSummaryQueryKey(
      currentSubaccount.chainEnv,
      subaccountOwner,
      targetSubaccountName,
      debouncedTxs,
    ),
    queryFn: async (): Promise<{
      exists: boolean;
      current: AnnotatedSubaccountSummary;
      estimated: AnnotatedSubaccountSummary;
    }> => {
      if (disabled) {
        throw new QueryDisabledError();
      }

      const response =
        await nadoClient.subaccount.getEngineEstimatedSubaccountSummary({
          subaccountOwner: subaccountOwner,
          subaccountName: targetSubaccountName,
          txs: debouncedTxs,
          preState: true,
        });
      if (!response.preState) {
        throw new Error(
          '[useQuerySubaccountEstimatedSummary] Failed to fetch estimated subaccount summary (preState is missing)',
        );
      }

      return {
        exists: response.exists,
        current: annotateSubaccountSummary({
          // the current state is the pre-state (before txs)
          summary: response.preState,
          getSpotMetadata,
          getPerpMetadata,
        }),
        estimated: annotateSubaccountSummary({
          summary: response,
          getSpotMetadata,
          getPerpMetadata,
        }),
      };
    },
    enabled: !disabled,
    refetchInterval: 10000,
  });
}
