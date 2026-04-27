import { BigNumbers } from '@nadohq/client';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import { MAINT_MARGIN_USAGE_WARNING_TOAST_ID } from 'client/modules/notifications/handlers/handleMaintMarginUsageNotificationDispatch';
import { MARGIN_USAGE_WARNING_TOAST_ID } from 'client/modules/notifications/handlers/handleMarginUsageWarningNotificationDispatch';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { roundToDecimalPlaces } from 'client/utils/rounding';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useSubaccountRiskEventEmitter() {
  const { data: portfolioOverview } = useSubaccountOverview();
  const { dispatchNotification } = useNotificationManagerContext();

  /*
   * Maint. Margin Usage trigger
   */
  const maintMarginUsageFraction =
    portfolioOverview?.maintMarginUsageFractionBounded;
  const hasTriggeredRisk = useRef<boolean>(false);

  useEffect(
    () => {
      // Only allow a notification to be dispatched if maintenance margin usage exists
      if (!maintMarginUsageFraction) {
        return;
      }

      // Only allow a notification to be dispatched if maintenance margin usage reaches 80%
      // and has not been triggered previously
      if (maintMarginUsageFraction.gte(0.8) && !hasTriggeredRisk.current) {
        dispatchNotification({
          type: 'maint_margin_usage_warning',
          data: {
            maintMarginUsageFraction,
          },
        });
        hasTriggeredRisk.current = true;
        // This condition will dismiss the notification if the maintenance margin usage
        // fraction is less than 80% and the notification has been triggered
      } else if (maintMarginUsageFraction.lt(0.8) && hasTriggeredRisk.current) {
        toast.dismiss(MAINT_MARGIN_USAGE_WARNING_TOAST_ID);
        hasTriggeredRisk.current = false;
      }
    },
    // Fire only on maintenance margin usage changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maintMarginUsageFraction],
  );

  /*
   * Margin Usage trigger
   */

  // Rounding to 2 decimal places to avoid unnecessary notifications
  // and useEffect rerenders
  const roundedMarginUsageFraction = roundToDecimalPlaces(
    portfolioOverview?.marginUsageFractionBounded ?? BigNumbers.ZERO,
    2,
  ).toNumber();
  const hasTriggeredMargin = useRef<boolean>(false);

  useEffect(
    () => {
      // This condition will allow a notification to be dispatched if
      // subaccount initial margin reaches 100% and has not been triggered previously
      if (roundedMarginUsageFraction === 1 && !hasTriggeredMargin.current) {
        dispatchNotification({
          type: 'margin_usage_warning',
        });
        hasTriggeredMargin.current = true;
        // This condition will dismiss the notification if the margin usage
        // fraction is less than 100% and the notification has been triggered
      } else if (
        roundedMarginUsageFraction !== 1 &&
        hasTriggeredMargin.current
      ) {
        toast.dismiss(MARGIN_USAGE_WARNING_TOAST_ID);
        hasTriggeredMargin.current = false;
      }
    },
    // Fire only on margin usage changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roundedMarginUsageFraction],
  );
}
