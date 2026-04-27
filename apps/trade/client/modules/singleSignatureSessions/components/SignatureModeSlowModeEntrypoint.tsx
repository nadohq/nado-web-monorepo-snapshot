import { LinkButton } from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { Trans } from 'react-i18next';

export function SignatureModeSlowModeEntrypoint({
  isSmartContractWalletConnected,
}: {
  isSmartContractWalletConnected: boolean | undefined;
}) {
  const { push } = useDialog();

  if (isSmartContractWalletConnected) {
    // Display a more prominent message if we know the user is using a smart contract wallet, the primary CTA's will
    // be hidden in lieu of this message
    return (
      <div className="text-accent">
        <Trans
          i18nKey={($) => $.pleaseUseAdvancedOneClickTradingSettings}
          components={{
            action: (
              <LinkButton
                colorVariant="secondary"
                onClick={() => {
                  push({
                    type: 'signature_mode_slow_mode_settings',
                    params: {},
                  });
                }}
              />
            ),
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <Trans
        i18nKey={($) => $.smartContractWalletQuestion}
        components={{
          action: (
            <LinkButton
              colorVariant="secondary"
              onClick={() => {
                push({
                  type: 'signature_mode_slow_mode_settings',
                  params: {},
                });
              }}
            />
          ),
        }}
      />
    </div>
  );
}
