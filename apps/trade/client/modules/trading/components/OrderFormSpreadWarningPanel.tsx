import { WarningPanel } from 'client/components/WarningPanel';
import { useTranslation } from 'react-i18next';

export function OrderFormSpreadWarningPanel() {
  const { t } = useTranslation();

  return (
    <WarningPanel title={t(($) => $.spreadIsHigh)}>
      {t(($) => $.manageRiskSlippageLimitOrders)}
    </WarningPanel>
  );
}
