import { SignatureModeSlowModeEntrypoint } from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeEntrypoint';
import { useTranslation } from 'react-i18next';

export function SignatureModeInfo({
  isSmartContractWalletConnected,
}: {
  isSmartContractWalletConnected: boolean | undefined;
}) {
  const { t } = useTranslation();

  return (
    <div className="text-text-tertiary flex flex-col gap-y-2">
      <p>{t(($) => $.oneClickTradingBenefits)}</p>
      <p>{t(($) => $.changeOneClickTradingPreferencesInSettings)}</p>
      <SignatureModeSlowModeEntrypoint
        isSmartContractWalletConnected={isSmartContractWalletConnected}
      />
    </div>
  );
}
