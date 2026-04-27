import { BigNumber } from 'bignumber.js';
import {
  ClosePositionParams,
  useExecuteClosePosition,
} from 'client/hooks/execute/placeOrder/useExecuteClosePosition';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { OrderNotificationMetadata } from 'client/modules/notifications/types';
import { useCallback } from 'react';

interface ClosePositionWithNotificationParams extends ClosePositionParams {
  fraction: number;
  positionAmount: BigNumber;
  metadata: OrderNotificationMetadata;
}

/**
 * Executes a close position order and dispatches a notification for the result.
 */
export function useExecuteClosePositionWithNotification() {
  const { dispatchNotification } = useNotificationManagerContext();
  const { mutateAsync, ...rest } = useExecuteClosePosition();

  const closePositionWithNotification = useCallback(
    (params: ClosePositionWithNotificationParams) => {
      const { fraction, positionAmount, metadata, ...closePositionParams } =
        params;

      const executeResult = mutateAsync(closePositionParams);

      dispatchNotification({
        type: 'close_position',
        data: {
          closePositionParams: {
            fraction,
            positionAmount,
            limitPrice: closePositionParams.limitPrice,
            size: closePositionParams.size,
            metadata,
          },
          executeResult,
        },
      });

      return executeResult;
    },
    [dispatchNotification, mutateAsync],
  );

  return {
    closePositionWithNotification,
    ...rest,
  };
}
