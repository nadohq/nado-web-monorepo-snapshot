import { WarningPanel } from 'client/components/WarningPanel';
import { useTranslation } from 'react-i18next';

export function DepositApproveWarning({ symbol }: { symbol: string }) {
  const { t } = useTranslation();

  return (
    <WarningPanel>
      {t(($) => $.approvalForSymbolRequired, { symbol })}
    </WarningPanel>
  );
}
