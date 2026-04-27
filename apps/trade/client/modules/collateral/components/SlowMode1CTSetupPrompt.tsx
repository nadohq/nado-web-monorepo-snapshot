import { DisclosureCard, LinkButton } from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { Trans, useTranslation } from 'react-i18next';

export function SlowMode1CTSetupPrompt() {
  const { t } = useTranslation();

  const { push } = useDialog();
  const pushSlowModeSettingsDialog = () => {
    push({
      type: 'signature_mode_slow_mode_settings',
      params: {},
    });
  };

  return (
    <DisclosureCard
      title={t(($) => $.enableOneClickTrading)}
      description={
        <>
          {t(($) => $.smartContractWalletNotice)}
          <br />
          <Trans
            i18nKey={($) => $.pleaseEnableOneClickTradingToWithdraw}
            components={{
              action: (
                <LinkButton
                  colorVariant="accent"
                  onClick={pushSlowModeSettingsDialog}
                />
              ),
            }}
          />
        </>
      }
    />
  );
}
