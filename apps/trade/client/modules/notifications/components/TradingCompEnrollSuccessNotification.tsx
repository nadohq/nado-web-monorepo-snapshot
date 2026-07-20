import { Icons } from '@nadohq/web-ui';
import { ActionToast } from 'client/components/Toast/ActionToast/ActionToast';
import { ToastProps } from 'client/components/Toast/types';
import { useTranslation } from 'react-i18next';

export function TradingCompEnrollSuccessNotification({
  onDismiss,
  ttl,
}: ToastProps) {
  const { t } = useTranslation();

  return (
    <ActionToast.Container>
      <ActionToast.TextHeader
        variant="success"
        icon={Icons.CheckCircle}
        onDismiss={onDismiss}
      >
        {t(($) => $.notifications.tradingCompEnrollSuccess.title)}
      </ActionToast.TextHeader>
      <ActionToast.Separator variant="success" ttl={ttl} />
      <ActionToast.Body variant="success">
        {t(($) => $.notifications.tradingCompEnrollSuccess.body)}
      </ActionToast.Body>
    </ActionToast.Container>
  );
}
