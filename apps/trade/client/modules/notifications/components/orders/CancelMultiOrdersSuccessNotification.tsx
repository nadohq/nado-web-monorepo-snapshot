import { ActionToast } from 'client/components/Toast/ActionToast/ActionToast';
import { ToastProps } from 'client/components/Toast/types';
import { CancelMultiOrdersNotificationData } from 'client/modules/notifications/types';
import { useTranslation } from 'react-i18next';

interface CancelMultiOrdersNotificationProps extends ToastProps {
  numOrders: CancelMultiOrdersNotificationData['numOrders'];
}

export function CancelMultiOrdersSuccessNotification({
  numOrders,
  ttl,
  onDismiss,
}: CancelMultiOrdersNotificationProps) {
  const { t } = useTranslation();

  return (
    <ActionToast.Container>
      <ActionToast.TextHeader variant="success" onDismiss={onDismiss}>
        {t(($) => $.notifications.ordersCancelled)}
      </ActionToast.TextHeader>
      <ActionToast.Separator variant="success" ttl={ttl} />
      <ActionToast.Body variant="success">
        <p>
          {t(($) => $.notifications.cancelMultiOrdersSuccess, {
            count: numOrders,
          })}
        </p>
      </ActionToast.Body>
    </ActionToast.Container>
  );
}
