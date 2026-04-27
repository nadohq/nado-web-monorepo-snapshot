import { TriggerServerCancelReason } from '@nadohq/client';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useQueryTwapExecutions } from 'client/hooks/query/useQueryTwapExecutions';
import { secondsToMilliseconds } from 'date-fns';
import { type TFunction } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Summary of TWAP execution statuses
 */
interface TwapExecutionsSummary {
  /** Total number of executions */
  total: number;
  /** Number of pending executions */
  pending: number;
  /** Number of successfully executed */
  executed: number;
  /** Number of failed or cancelled executions */
  failedOrCancelled: number;
  /** All executions with status details */
  executions: TwapExecution[];
}

type TwapExecutionStatus = 'pending' | 'executed' | 'failed' | 'cancelled';

/**
 * Details of a TWAP execution for table display
 */
export interface TwapExecution extends WithDataTableRowId {
  executionId: number;
  scheduledTimeMillis: number;
  type: TwapExecutionStatus;
  reason?: string;
}

/**
 * Hook to fetch and map TWAP executions for display
 */
export function useTwapExecutions({ digest }: { digest: string | undefined }) {
  const { t } = useTranslation();

  const { data: executionsData, isLoading: isLoadingExecutionsData } =
    useQueryTwapExecutions({ digest });

  const mappedData = useMemo(() => {
    if (!executionsData) {
      return;
    }

    const summary: TwapExecutionsSummary = {
      total: executionsData.length,
      pending: 0,
      executed: 0,
      failedOrCancelled: 0,
      executions: [],
    };

    for (const execution of executionsData) {
      const { status } = execution;

      const scheduledTimeMillis = secondsToMilliseconds(
        execution.scheduledTime,
      );

      switch (status.type) {
        case 'pending':
          summary.pending++;
          summary.executions.push({
            rowId: String(execution.executionId),
            executionId: execution.executionId,
            scheduledTimeMillis,
            type: 'pending',
          });
          break;
        case 'executed': {
          const executeResponse = status.executeResponse;
          if (executeResponse.status === 'failure') {
            // Execution was attempted but the order submission failed
            summary.failedOrCancelled++;
            summary.executions.push({
              rowId: String(execution.executionId),
              executionId: execution.executionId,
              scheduledTimeMillis,
              type: 'failed',
              reason: executeResponse.error,
            });
          } else {
            summary.executed++;
            summary.executions.push({
              rowId: String(execution.executionId),
              executionId: execution.executionId,
              scheduledTimeMillis,
              type: 'executed',
            });
          }
          break;
        }
        // Pre-execution failure - couldn't even attempt the execution
        case 'failed':
          summary.failedOrCancelled++;
          summary.executions.push({
            rowId: String(execution.executionId),
            executionId: execution.executionId,
            scheduledTimeMillis,
            type: 'failed',
            reason: status.error,
          });
          break;
        case 'cancelled':
          summary.failedOrCancelled++;
          summary.executions.push({
            rowId: String(execution.executionId),
            executionId: execution.executionId,
            scheduledTimeMillis,
            type: 'cancelled',
            reason: formatCancelReason(
              status.reason as TriggerServerCancelReason,
              t,
            ),
          });
          break;
      }
    }

    return summary;
  }, [executionsData, t]);

  return {
    data: mappedData,
    isLoading: isLoadingExecutionsData,
  };
}

/**
 * Format a cancellation reason to be more user-friendly
 */
function formatCancelReason(
  reason: TriggerServerCancelReason,
  t: TFunction,
): string {
  switch (reason) {
    case 'user_requested':
      return t(($) => $.cancelledByUser);
    case 'linked_signer_changed':
      return t(($) => $.cancelledLinkedSignerChanged);
    case 'expired':
      return t(($) => $.orderExpired);
    case 'account_health':
      return t(($) => $.cancelledAccountHealth);
    case 'isolated_subaccount_closed':
      return t(($) => $.cancelledIsolatedSubaccountClosed);
    case 'dependent_order_cancelled':
      return t(($) => $.cancelledDependentOrder);
  }
}
