import { useSubaccountContext } from '@nadohq/react-client';
import { useUpdateQueries } from 'client/hooks/execute/util/useUpdateQueries';
import { subaccountOpenTriggerOrdersQueryKey } from 'client/hooks/query/subaccount/useQuerySubaccountOpenTriggerOrders';

export function useUpdateOpenTriggerOrdersQuery() {
  const { currentSubaccount } = useSubaccountContext();
  return useUpdateQueries([
    subaccountOpenTriggerOrdersQueryKey(
      currentSubaccount.chainEnv,
      currentSubaccount.address,
      currentSubaccount.name,
    ),
  ]);
}
