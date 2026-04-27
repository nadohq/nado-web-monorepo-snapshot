import { WithClassnames } from '@nadohq/web-common';
import { UserDisclosureDismissibleCard } from 'client/components/UserDisclosureDismissibleCard';
import { useTranslation } from 'react-i18next';

export function BorrowingFundsDismissible({
  className,
  enableBorrows,
}: WithClassnames<{ enableBorrows: boolean }>) {
  const { t } = useTranslation();

  if (!enableBorrows) return null;
  return (
    <UserDisclosureDismissibleCard
      disclosureKey="borrow_risk_warning"
      title={t(($) => $.withdrawingBorrowedFunds)}
      className={className}
      description={t(($) => $.borrowRiskWarningDescription)}
    />
  );
}
