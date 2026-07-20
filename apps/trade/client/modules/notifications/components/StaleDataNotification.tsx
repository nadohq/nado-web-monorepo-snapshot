import { Icons, SecondaryButton } from '@nadohq/web-ui';
import { TOAST_HEADER_ICON_SIZE } from 'client/components/Toast/consts';
import { Toast } from 'client/components/Toast/Toast';
import { ToastProps } from 'client/components/Toast/types';
import { useTranslation } from 'react-i18next';

export function StaleDataNotification({ onDismiss, ttl }: ToastProps) {
  const { t } = useTranslation();

  return (
    <Toast.Container className="border-negative border">
      <Toast.Header onDismiss={onDismiss}>
        <div className="flex items-center gap-x-2">
          <Icons.Warning size={TOAST_HEADER_ICON_SIZE} />
          <span>{t(($) => $.notifications.staleData.title)}</span>
        </div>
      </Toast.Header>
      <Toast.Separator ttl={ttl} className="bg-negative" />
      <Toast.Body className="flex flex-col items-start gap-y-3">
        <p>{t(($) => $.notifications.staleData.body)}</p>
        <SecondaryButton size="xs" onClick={() => window.location.reload()}>
          {t(($) => $.buttons.reload)}
        </SecondaryButton>
      </Toast.Body>
    </Toast.Container>
  );
}
