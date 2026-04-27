import { BigNumbers } from '@nadohq/client';
import { safeDiv } from '@nadohq/react-client';
import {
  CloseAllPositionsFilter,
  useExecuteCloseAllPositions,
} from 'client/hooks/execute/placeOrder/useExecuteCloseAllPositions';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo } from 'react';

export function useCloseAllPositionsDialog({
  productIds,
  onlySide,
}: CloseAllPositionsFilter) {
  const { dispatchNotification } = useNotificationManagerContext();
  const { hide } = useDialog();
  const { closeAllPositions, status, positionsToClose } =
    useExecuteCloseAllPositions({ productIds, onlySide });

  useRunWithDelayOnCondition({
    condition: status === 'success',
    fn: hide,
    delay: RUN_WITH_DELAY_DURATIONS.SHORT,
  });

  const buttonState = useMemo((): BaseActionButtonState => {
    if (status === 'pending') {
      return 'loading';
    } else if (status === 'success') {
      return 'success';
    } else if (status === 'idle') {
      return 'idle';
    } else {
      return 'disabled';
    }
  }, [status]);

  // Calculate total estimated PnL and weighted average ROE from positions to close
  const { totalEstimatedPnlUsd, totalEstimatedRoeFrac } = useMemo(() => {
    if (!positionsToClose?.length) {
      return {
        totalEstimatedPnlUsd: undefined,
        totalEstimatedRoeFrac: undefined,
      };
    }

    let totalEstimatedPnlUsd = BigNumbers.ZERO;
    let totalNotional = BigNumbers.ZERO;
    let weightedRoeSum = BigNumbers.ZERO;

    positionsToClose.forEach((position) => {
      const { estimatedPnlUsd, notionalValueUsd, estimatedPnlFrac } = position;

      if (!estimatedPnlUsd || !estimatedPnlFrac || !notionalValueUsd) {
        return;
      }

      totalEstimatedPnlUsd = totalEstimatedPnlUsd.plus(estimatedPnlUsd);
      totalNotional = totalNotional.plus(notionalValueUsd);
      // For weighted average ROE: accumulate sum of (notional × ROE) for each position.
      // This sum will be divided by total notional to get the weighted average ROE.
      weightedRoeSum = weightedRoeSum.plus(
        notionalValueUsd.times(estimatedPnlFrac),
      );
    });

    // Weighted average ROE
    const totalEstimatedRoeFrac = safeDiv(weightedRoeSum, totalNotional);

    return {
      totalEstimatedPnlUsd,
      totalEstimatedRoeFrac,
    };
  }, [positionsToClose]);

  const onSubmit = async () => {
    const executeResultPromise = closeAllPositions({});
    dispatchNotification({
      type: 'close_multi_positions',
      data: {
        executeResult: executeResultPromise,
      },
    });
  };

  return {
    onSubmit,
    buttonState,
    totalEstimatedPnlUsd,
    totalEstimatedRoeFrac,
  };
}
