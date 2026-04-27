import { WarningPanel } from 'client/components/WarningPanel';
import { SignatureModeSettingsUserStateWarning } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeDisable1CTDialogContent/useSignatureModeDisable1CTDialogContent';
import { useTranslation } from 'react-i18next';

export function SignatureModeUserStateWarning({
  userStateWarning,
}: {
  userStateWarning?: SignatureModeSettingsUserStateWarning;
}) {
  const { t } = useTranslation();

  if (!userStateWarning) return null;

  const warningContentData = {
    will_cancel_orders: {
      title: t(($) => $.limitAndTpSlOrdersWillBeCancelled),
      description: t(($) => $.cancelOrdersOnDisable1ctWarning),
    },
    last_allowed_switch: {
      title: t(($) => $.lastChangeAllowedForThisWeek),
      description: t(($) => $.oneClickTradingLimitWarning),
    },
  }[userStateWarning];

  return (
    <WarningPanel title={warningContentData.title}>
      {warningContentData.description}
    </WarningPanel>
  );
}
