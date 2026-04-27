import { WarningPanel } from 'client/components/WarningPanel';
import { useTranslation } from 'react-i18next';

interface DepositWarningPanelProps {
  chainName: string;
}

export function DirectDepositReceiveWarningPanel({
  chainName,
}: DepositWarningPanelProps) {
  const { t } = useTranslation();

  return (
    <WarningPanel className="bg-warning-muted text-warning">
      {t(($) => $.directDepositReceiveWarning, { chainName })}
    </WarningPanel>
  );
}
