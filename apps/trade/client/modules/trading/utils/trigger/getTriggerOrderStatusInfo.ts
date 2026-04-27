import { TriggerOrderInfo } from '@nadohq/client';
import type { TFunction } from 'i18next';
import safeStringify from 'safe-stable-stringify';

export interface TriggerOrderStatusInfo {
  /**
   * The text to display for the status
   */
  statusText: string;
  /**
   * The text to display for the details
   */
  detailsText?: string;
}

/**
 * Get the status info for a trigger order
 * @param t - the t function for i18n
 * @param param0 - The trigger order info
 * @returns The status info
 */
export function getTriggerOrderStatusInfo(
  t: TFunction,
  { status }: TriggerOrderInfo,
): TriggerOrderStatusInfo {
  switch (status.type) {
    case 'cancelled':
      switch (status.reason) {
        case 'expired':
          return { statusText: t(($) => $.orderStatus.expired) };
        case 'user_requested':
          return {
            statusText: t(($) => $.orderStatus.cancelled),
            detailsText: t(
              ($) => $.orderStatus.cancelledDetails.manuallyCancelled,
            ),
          };
        case 'isolated_subaccount_closed':
          return {
            statusText: t(($) => $.orderStatus.cancelled),
            detailsText: t(
              ($) => $.orderStatus.cancelledDetails.isolatedSubaccountClosed,
            ),
          };
        case 'linked_signer_changed':
          return {
            statusText: t(($) => $.orderStatus.cancelled),
            detailsText: t(($) => $.orderStatus.cancelledDetails.signerChanged),
          };
        case 'account_health':
          return {
            statusText: t(($) => $.orderStatus.cancelled),
            detailsText: t(
              ($) => $.orderStatus.cancelledDetails.accountHealthExceeded,
            ),
          };
        case 'dependent_order_cancelled':
          return {
            statusText: t(($) => $.orderStatus.cancelled),
            detailsText: t(
              ($) => $.orderStatus.cancelledDetails.dependentOrderCancelled,
            ),
          };
        default:
          return {
            statusText: t(($) => $.orderStatus.cancelled),
            detailsText: status.reason,
          };
      }
    case 'triggered':
      if (status.result.status === 'success') {
        return {
          statusText: t(($) => $.orderStatus.triggered),
        };
      }
      return {
        statusText: t(($) => $.orderStatus.error),
        detailsText: safeStringify(status.result, undefined, 2),
      };
    case 'triggering':
      return {
        statusText: t(($) => $.orderStatus.triggering),
      };
    case 'waiting_price':
      return {
        statusText: t(($) => $.orderStatus.waitingForPrice),
      };
    case 'waiting_dependency':
      return {
        statusText: t(($) => $.orderStatus.waitingForDependency),
      };
    case 'twap_executing':
      return {
        statusText: t(($) => $.orderStatus.executing),
      };
    case 'twap_completed':
      return {
        statusText: t(($) => $.orderStatus.completed),
      };
    case 'internal_error':
      return {
        statusText: t(($) => $.orderStatus.error),
        detailsText: status.error,
      };
    default:
      // Should not reach
      return {
        statusText: t(($) => $.orderStatus.unknown),
        detailsText: safeStringify(status),
      };
  }
}
