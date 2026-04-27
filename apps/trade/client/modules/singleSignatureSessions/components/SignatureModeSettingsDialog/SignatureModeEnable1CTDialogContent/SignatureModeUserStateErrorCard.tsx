import { LinkButton } from '@nadohq/web-ui';
import { ErrorPanel } from 'client/components/ErrorPanel';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { SignatureModeSettingsUserStateError } from 'client/modules/singleSignatureSessions/components/SignatureModeSettingsDialog/SignatureModeEnable1CTDialogContent/useSignatureModeEnable1CTDialogContent';
import { Trans, useTranslation } from 'react-i18next';

export function SignatureModeUserStateErrorCard({
  userStateError,
}: {
  userStateError?: SignatureModeSettingsUserStateError;
}) {
  const { t } = useTranslation();
  const { push } = useDialog();
  if (!userStateError) return null;

  const errorDescription = {
    below_minimum_value: (
      <>
        <p>
          <Trans
            i18nKey={($) => $.activateOneClickTradingDepositDescription}
            components={{
              highlight: <span className="text-text-primary" />,
            }}
          />
        </p>
        <LinkButton
          colorVariant="secondary"
          onClick={() => push({ type: 'deposit_options', params: {} })}
        >
          {t(($) => $.buttons.deposit)}
        </LinkButton>
      </>
    ),
    out_of_switches: t(($) => $.oneClickTradingLimitReached),
  }[userStateError];

  return <ErrorPanel>{errorDescription}</ErrorPanel>;
}
