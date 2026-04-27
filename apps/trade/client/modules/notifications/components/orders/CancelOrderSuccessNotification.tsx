import { ActionToast } from 'client/components/Toast/ActionToast/ActionToast';
import { ToastProps } from 'client/components/Toast/types';
import { CancelOrderNotificationData } from 'client/modules/notifications/types';
import { ORDER_DISPLAY_TYPES } from 'client/modules/trading/consts/orderDisplayTypes';
import { getOrderDisplayTypeLabel } from 'client/modules/trading/utils/getOrderDisplayTypeLabel';
import { includes } from 'lodash';
import { useTranslation } from 'react-i18next';

interface CancelOrderNotificationProps extends ToastProps {
  data: CancelOrderNotificationData['cancelOrderParams'];
}

export function CancelOrderSuccessNotification({
  data,
  ttl,
  onDismiss,
}: CancelOrderNotificationProps) {
  const { t } = useTranslation();

  const { metadata, orderDisplayType } = data;

  const isPriceTriggerOrder = includes(
    [...ORDER_DISPLAY_TYPES.tpSl, ...ORDER_DISPLAY_TYPES.stop],
    orderDisplayType,
  );
  const bodyText = isPriceTriggerOrder
    ? t(($) => $.notifications.cancelOrderSuccess.orderCancelled, {
        marketName: metadata.marketName,
      })
    : t(($) => $.notifications.cancelOrderSuccess.remainingOrderCancelled, {
        marketName: metadata.marketName,
      });

  return (
    <ActionToast.Container>
      <ActionToast.TextHeader variant="success" onDismiss={onDismiss}>
        {t(($) => $.notifications.cancelOrderSuccess.title, {
          orderType: getOrderDisplayTypeLabel(t, orderDisplayType),
        })}
      </ActionToast.TextHeader>
      <ActionToast.Separator variant="success" ttl={ttl} />
      <ActionToast.Body variant="success">{bodyText}</ActionToast.Body>
    </ActionToast.Container>
  );
}
