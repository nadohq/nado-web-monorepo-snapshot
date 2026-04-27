import { asyncResult, getOrderNonce } from '@nadohq/client';
import { useMutation } from '@tanstack/react-query';
import {
  CancellableOrder,
  CancelOrdersParams,
  CancelOrdersResult,
} from 'client/hooks/execute/cancelOrder/types';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useUpdateMaxSizeQueries } from 'client/hooks/execute/util/useUpdateMaxSizeQueries';
import { useUpdateOpenEngineOrdersQuery } from 'client/hooks/execute/util/useUpdateOpenEngineOrdersQuery';
import { useUpdateOpenTriggerOrdersQuery } from 'client/hooks/execute/util/useUpdateOpenTriggerOrdersQuery';
import { useGetRecvTime } from 'client/hooks/util/useGetRecvTime';
import { partition } from 'lodash';
import { useCallback } from 'react';

function partitionOrdersToCancel(orders: CancellableOrder[]) {
  const [triggerOrdersToCancel, engineOrdersToCancel] = partition(
    orders,
    ({ isTrigger }) => isTrigger,
  );

  return {
    triggerOrdersToCancel,
    engineOrdersToCancel,
  };
}

export function useExecuteCancelOrders() {
  const updateOpenTriggerOrders = useUpdateOpenTriggerOrdersQuery();
  const updateOpenEngineOrders = useUpdateOpenEngineOrdersQuery();
  const updateMaxSizes = useUpdateMaxSizeQueries();

  const getRecvTime = useGetRecvTime();

  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: CancelOrdersParams,
        context: ValidExecuteContext,
      ): Promise<CancelOrdersResult> => {
        const result: CancelOrdersResult = {};

        const { triggerOrdersToCancel, engineOrdersToCancel } =
          partitionOrdersToCancel(params.orders);

        const nonce = getOrderNonce(await getRecvTime());

        // Engine should execute first as these orders are more important for cancellation
        // We use asyncResult in both cases to ensure that both requests are made
        if (engineOrdersToCancel.length) {
          result.engine = await asyncResult(
            context.nadoClient.market.cancelOrders({
              subaccountOwner: context.subaccount.address,
              subaccountName: context.subaccount.name,
              chainId: context.subaccount.chainId,
              productIds: engineOrdersToCancel.map((order) => order.productId),
              digests: engineOrdersToCancel.map((order) => order.digest),
              nonce,
            }),
          );
        }

        if (triggerOrdersToCancel.length) {
          result.trigger = await asyncResult(
            context.nadoClient.market.cancelTriggerOrders({
              subaccountOwner: context.subaccount.address,
              subaccountName: context.subaccount.name,
              chainId: context.subaccount.chainId,
              productIds: triggerOrdersToCancel.map((order) => order.productId),
              digests: triggerOrdersToCancel.map((order) => order.digest),
              nonce,
            }),
          );
        }

        // If there are any errors, propagate them up
        if (result.engine?.[1]) {
          throw result.engine[1];
        }
        if (result.trigger?.[1]) {
          throw result.trigger[1];
        }

        return result;
      },
      [getRecvTime],
    ),
  );

  return useMutation({
    mutationFn,
    onSuccess(data, variables) {
      if (data.trigger) {
        updateOpenTriggerOrders();
      }
      if (data.engine) {
        const engineOrderProductIds = new Set(
          partitionOrdersToCancel(variables.orders).engineOrdersToCancel.map(
            (order) => order.productId,
          ),
        );
        updateOpenEngineOrders(Array.from(engineOrderProductIds.values()));
        updateMaxSizes();
      }
    },
    onError(error, variables) {
      logExecuteError('CancelOrders', error, variables);
    },
  });
}
