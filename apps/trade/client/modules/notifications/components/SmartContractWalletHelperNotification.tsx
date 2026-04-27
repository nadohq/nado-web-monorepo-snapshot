import { SecondaryButton } from '@nadohq/web-ui';
import { Toast } from 'client/components/Toast/Toast';
import { ToastProps } from 'client/components/Toast/types';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useTranslation } from 'react-i18next';

export function SmartContractWalletHelperNotification({
  onDismiss,
  ttl,
}: ToastProps) {
  const { t } = useTranslation();
  const { push } = useDialog();
  const pushSlowModeSettingsDialog = () => {
    push({
      type: 'signature_mode_slow_mode_settings',
      params: {},
    });
    onDismiss();
  };

  const content = (
    <div className="flex flex-col items-start gap-y-3">
      <p>{t(($) => $.notifications.smartContractWalletRequirement)}</p>
      <SecondaryButton size="xs" onClick={pushSlowModeSettingsDialog}>
        {t(($) => $.buttons.enable1CT)}
      </SecondaryButton>
    </div>
  );

  return (
    <Toast.Container>
      <Toast.Header onDismiss={onDismiss}>
        {t(($) => $.oneClickTradingRequired)}
      </Toast.Header>
      <Toast.Separator ttl={ttl} />
      <Toast.Body>{content}</Toast.Body>
    </Toast.Container>
  );
}
