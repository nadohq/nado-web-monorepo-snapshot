import { Icons, SecondaryButton } from '@nadohq/web-ui';
import { TOAST_HEADER_ICON_SIZE } from 'client/components/Toast/consts';
import { Toast } from 'client/components/Toast/Toast';
import { ToastProps } from 'client/components/Toast/types';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useTranslation } from 'react-i18next';

export type MarginUsageWarningNotificationProps = ToastProps;

export function MarginUsageWarningNotification({
  ttl,
  onDismiss,
}: MarginUsageWarningNotificationProps) {
  const { t } = useTranslation();

  const { show } = useDialog();

  const bodyContent = (
    <>
      <p>{t(($) => $.notifications.marginUsageWarning.body)}</p>
      <SecondaryButton
        size="xs"
        onClick={() => {
          show({ type: 'deposit_options', params: {} });
          onDismiss();
        }}
        className="text-text-secondary"
      >
        {t(($) => $.buttons.depositFunds)}
      </SecondaryButton>
    </>
  );

  const headerContent = (
    <div className="flex items-center gap-x-2">
      <Icons.Warning size={TOAST_HEADER_ICON_SIZE} />
      <span>{t(($) => $.notifications.marginUsageWarning.header)}</span>
    </div>
  );

  return (
    <Toast.Container>
      <Toast.Header onDismiss={onDismiss}>{headerContent}</Toast.Header>
      <Toast.Separator
        ttl={ttl}
        className="from-positive via-warning to-negative bg-gradient-to-r"
      />
      <Toast.Body className="flex flex-col items-start gap-y-2">
        {bodyContent}
      </Toast.Body>
    </Toast.Container>
  );
}
