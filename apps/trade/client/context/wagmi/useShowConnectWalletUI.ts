import { useLogout, usePrivy } from '@privy-io/react-auth';
import { useMultiWagmi } from 'client/context/wagmi/useMultiWagmi';
import { useRepeatedClickCountHandler } from 'client/hooks/ui/useRepeatedClickCountHandler';
import { useAnalyticsContext } from 'client/modules/analytics/AnalyticsContext';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useCallback } from 'react';

const DELAY_TO_ENSURE_PROVIDER_RENDERED = 300;

export function useShowConnectWalletUI() {
  const { switchWagmiProvider } = useMultiWagmi();

  const { show } = useDialog();
  const {
    connectOrCreateWallet: baseConnectOrCreateWallet,
    ready,
    authenticated,
  } = usePrivy();
  const { sendGTMEvent } = useAnalyticsContext();

  const connectOrCreateWallet = useCallback(() => {
    setTimeout(() => {
      baseConnectOrCreateWallet();
      // send the same event as our custom connect dialog to keep the analytics consistent
      sendGTMEvent({ event: 'dialog_opened', dialogType: 'connect' });
    }, DELAY_TO_ENSURE_PROVIDER_RENDERED);
  }, [baseConnectOrCreateWallet, sendGTMEvent]);

  // The async `logout` returned from usePrivy is racy, to ensure we can reliably act upon logout,
  // we need to use the `useLogout` hook which provides an `onSuccess` callback.
  const { logout: forceLogoutThenConnectOrCreateWallet } = useLogout({
    onSuccess: () => {
      connectOrCreateWallet();
    },
  });

  const showConnectWalletUI = useCallback(
    ({ showPrivy }: { showPrivy: boolean }) => {
      if (showPrivy) {
        switchWagmiProvider('privy');

        if (ready && authenticated) {
          // defensively log out of Privy just in case the auth token is stale (eg. failed Google redirect)
          // this is a fail-safe to ensure an user can always start from a clean state when pressing Connect button,
          // regardless of whatever "authenticated" state the Privy provider may be stuck in.
          forceLogoutThenConnectOrCreateWallet();
          return;
        }

        connectOrCreateWallet();
        return;
      }

      switchWagmiProvider('wagmi');
      setTimeout(() => {
        show({ type: 'connect_custom_wallet', params: {} });
      }, DELAY_TO_ENSURE_PROVIDER_RENDERED);
    },
    [
      switchWagmiProvider,
      connectOrCreateWallet,
      ready,
      authenticated,
      forceLogoutThenConnectOrCreateWallet,
      show,
    ],
  );

  // wrap the handler with the repeated click count logic here
  // this allows consistent handling of the "custom connect" flow across the app
  const onConnectWalletClick = useRepeatedClickCountHandler({
    handler: (count) => {
      const showPrivy = count < 3;
      showConnectWalletUI({ showPrivy });
    },
  });

  return {
    onConnectWalletClick,
  };
}
