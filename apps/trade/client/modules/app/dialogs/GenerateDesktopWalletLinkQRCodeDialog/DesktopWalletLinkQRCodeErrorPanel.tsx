import { LinkButton } from '@nadohq/web-ui';
import { ErrorPanel } from 'client/components/ErrorPanel';
import { GenerateWalletLinkQRCodeError } from 'client/modules/app/dialogs/GenerateDesktopWalletLinkQRCodeDialog/GenerateDesktopWalletLinkQRCodeDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { Trans, useTranslation } from 'react-i18next';

interface Props {
  error: GenerateWalletLinkQRCodeError | null;
}

export function DesktopWalletLinkQRCodeErrorPanel({ error }: Props) {
  const { t } = useTranslation();
  const { push } = useDialog();

  if (!error) {
    return null;
  }

  const content = (() => {
    switch (error) {
      case 'requires_approve_sign_once':
        return (
          <>
            <p>{t(($) => $.errors.oneClickTradingApprovalRequired)}</p>
            <div>
              <Trans
                i18nKey={($) =>
                  $.generateDesktopWalletLinkQRCodeDialog
                    .approve1CTAndEnsureRememberApproval
                }
                components={{
                  action: (
                    <LinkButton
                      colorVariant="primary"
                      onClick={() =>
                        push({
                          type: 'single_signature_reapproval',
                          params: {},
                        })
                      }
                    />
                  ),
                  highlight: <span className="text-text-primary" />,
                }}
              />
            </div>
          </>
        );
      case 'requires_save_private_key':
        return (
          <>
            <p>{t(($) => $.errors.oneClickTradingRememberApprovalOff)}</p>
            <div>
              <Trans
                i18nKey={($) =>
                  $.generateDesktopWalletLinkQRCodeDialog.turnOnRememberApproval
                }
                components={{
                  action: (
                    <LinkButton
                      colorVariant="primary"
                      onClick={() =>
                        push({
                          type: 'single_signature_reapproval',
                          params: {},
                        })
                      }
                    />
                  ),
                }}
              />
            </div>
          </>
        );
      case 'requires_single_signature_session':
        return (
          <>
            <p>{t(($) => $.errors.oneClickTradingNotEnabled)}</p>
            <div>
              <Trans
                i18nKey={($) =>
                  $.generateDesktopWalletLinkQRCodeDialog
                    .enable1CTAndEnsureRememberApproval
                }
                components={{
                  action: (
                    <LinkButton
                      colorVariant="primary"
                      onClick={() =>
                        push({
                          type: 'signature_mode_settings',
                          params: {},
                        })
                      }
                    />
                  ),
                  highlight: <span className="text-text-primary" />,
                }}
              />
            </div>
          </>
        );
    }
  })();

  return <ErrorPanel>{content}</ErrorPanel>;
}
