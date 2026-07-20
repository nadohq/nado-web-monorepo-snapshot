import { ToastProps } from 'client/components/Toast/types';
import { useShowUserDisclosure } from 'client/modules/localstorage/userState/useShowUserDisclosure';
import { NewFeatureNotification } from 'client/modules/notifications/components/newFeature/NewFeatureNotification';
import { useTranslation } from 'react-i18next';

/**
 * One-time notice shown the first time a user opens the Fun deposit flow,
 * pointing them to the Classic Deposit UI setting.
 */
export function ClassicDepositUiNotification({
  onDismiss: baseOnDismiss,
  ttl,
}: ToastProps) {
  const { t } = useTranslation();
  const { dismiss } = useShowUserDisclosure('classic_deposit_ui');

  const onDismiss = () => {
    baseOnDismiss();
    dismiss();
  };

  return (
    <NewFeatureNotification
      title={t(($) => $.notifications.classicDepositUiNotification.title)}
      content={
        <p>
          {t(($) => $.notifications.classicDepositUiNotification.description)}
        </p>
      }
      onDismiss={onDismiss}
      ttl={ttl}
    />
  );
}
