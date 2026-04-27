import { nonNullFilter } from '@nadohq/web-common';
import { useMutation } from '@tanstack/react-query';
import { ExecutePlaceOrderParams } from 'client/hooks/execute/placeOrder/types';
import { usePlaceOrderMutationFn } from 'client/hooks/execute/placeOrder/usePlaceOrderMutationFn';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import { useExecuteInValidContext } from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateMaxSizeQueries } from 'client/hooks/execute/util/useUpdateMaxSizeQueries';
import { useUpdateOpenEngineOrdersQuery } from 'client/hooks/execute/util/useUpdateOpenEngineOrdersQuery';
import { useUpdateOpenTriggerOrdersQuery } from 'client/hooks/execute/util/useUpdateOpenTriggerOrdersQuery';
import { PlaceOrderExecuteResultError } from 'client/utils/errors/placeOrderExecuteResultError';
import { uniq } from 'lodash';
import { useCallback } from 'react';

export function useExecutePlaceOrder() {
  const placeOrderMutationFn = usePlaceOrderMutationFn();
  const updateOpenTriggerOrders = useUpdateOpenTriggerOrdersQuery();
  const updateOpenEngineOrders = useUpdateOpenEngineOrdersQuery();
  const updateMaxSizes = useUpdateMaxSizeQueries();

  const mutationFn = useExecuteInValidContext(placeOrderMutationFn);

  const handleRefetch = useCallback(
    (variables: ExecutePlaceOrderParams) => {
      switch (variables.orderType) {
        case 'stop_market':
        case 'stop_limit':
        case 'twap':
          updateOpenTriggerOrders();
          break;
        case 'multi_limit':
          // Refetch the product IDs within the suborders if defined, otherwise the parent order.
          // This is to support the case where the suborders are different products. In ex. closing multiple positions.
          const refetchProductIds = uniq([
            ...variables.orders
              .map((order) => order.productId)
              .filter(nonNullFilter),
            variables.productId,
          ]);

          updateOpenEngineOrders(refetchProductIds);
          updateMaxSizes();
          break;
        case 'limit':
          // Limit orders only affect the parent order
          updateOpenEngineOrders([variables.productId]);
          updateMaxSizes();
          break;
        case 'market':
          // Market orders should trigger a fill, which will be handled by a websocket event handler
          break;
      }
    },
    [updateOpenTriggerOrders, updateOpenEngineOrders, updateMaxSizes],
  );

  return useMutation({
    mutationFn,
    onSuccess(_, variables) {
      handleRefetch(variables);
    },
    onError(error, variables) {
      // For multi limit orders, we want to refetch the orders if the error is a PlaceOrderExecuteResultError because some orders may have been placed successfully.
      if (
        variables.orderType === 'multi_limit' &&
        error instanceof PlaceOrderExecuteResultError
      ) {
        handleRefetch(variables);
      }
      logExecuteError('PlaceOrder', error, variables);
    },
  });
}
