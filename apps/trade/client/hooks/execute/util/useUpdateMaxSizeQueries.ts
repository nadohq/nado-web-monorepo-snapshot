import { useSubaccountContext } from '@nadohq/react-client';
import { getMaxSizeQueryKeys } from 'client/hooks/execute/util/queryKeys';
import { useUpdateQueries } from 'client/hooks/execute/util/useUpdateQueries';

export function useUpdateMaxSizeQueries() {
  const { currentSubaccount } = useSubaccountContext();
  return useUpdateQueries(
    getMaxSizeQueryKeys(
      currentSubaccount.chainEnv,
      currentSubaccount.address,
      currentSubaccount.name,
    ),
    {
      // Prevents double-refetching in cases where websocket event handlers also trigger a refetch
      cancelRefetch: false,
    },
  );
}
