import { UserDisclosureDismissibleCard } from 'client/components/UserDisclosureDismissibleCard';
import { useTranslation } from 'react-i18next';

export function MaxRepayDismissible() {
  const { t } = useTranslation();

  return (
    <UserDisclosureDismissibleCard
      disclosureKey="max_repay_warning"
      title={t(($) => $.maxRepay)}
      description={t(($) => $.maxRepayWarningDescription)}
    />
  );
}
