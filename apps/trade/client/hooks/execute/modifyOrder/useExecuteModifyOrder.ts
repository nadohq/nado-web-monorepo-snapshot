import { useMutation } from '@tanstack/react-query';
import { useModifyOrderMutationFn } from 'client/hooks/execute/modifyOrder/useModifyOrderMutationFn';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import { useExecuteInValidContext } from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateMaxSizeQueries } from 'client/hooks/execute/util/useUpdateMaxSizeQueries';
import { useUpdateOpenEngineOrdersQuery } from 'client/hooks/execute/util/useUpdateOpenEngineOrdersQuery';
import { useUpdateOpenTriggerOrdersQuery } from 'client/hooks/execute/util/useUpdateOpenTriggerOrdersQuery';

export function useExecuteModifyOrder() {
  const cancelAndPlaceOrderMutationFn = useModifyOrderMutationFn();
  const updateOpenTriggerOrders = useUpdateOpenTriggerOrdersQuery();
  const updateOpenEngineOrders = useUpdateOpenEngineOrdersQuery();
  const updateMaxSizes = useUpdateMaxSizeQueries();

  const mutationFn = useExecuteInValidContext(cancelAndPlaceOrderMutationFn);

  return useMutation({
    mutationFn,
    onSuccess(_data, variables) {
      if (variables.isPriceTrigger) {
        updateOpenTriggerOrders();
      } else {
        updateOpenEngineOrders([variables.productId]);
        updateMaxSizes();
      }
    },
    onError(error, variables) {
      logExecuteError('ModifyOrder', error, variables);
    },
  });
}
