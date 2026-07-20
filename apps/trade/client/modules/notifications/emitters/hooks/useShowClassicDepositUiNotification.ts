import { useShowUserDisclosure } from 'client/modules/localstorage/userState/useShowUserDisclosure';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useEffect } from 'react';

/**
 * Fires the one-time notification that points users to the Classic Deposit UI setting.
 */
export function useShowClassicDepositUiNotification() {
  const { dispatchNotification } = useNotificationManagerContext();
  const { shouldShow } = useShowUserDisclosure('classic_deposit_ui');

  useEffect(() => {
    if (!shouldShow) {
      return;
    }
    dispatchNotification({ type: 'classic_deposit_ui_notification' });
  }, [shouldShow, dispatchNotification]);
}
