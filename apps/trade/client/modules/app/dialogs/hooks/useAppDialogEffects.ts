import { useEVMContext } from '@nadohq/react-client';
import { usePrevious } from 'ahooks';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useAddressGatedBetaState } from 'client/modules/app/gatedAppAccess/gatedBeta/useAddressGatedBetaState';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Manages app-wide flows for automatically showing / hiding dialogs
 */
export function useAppDialogEffects() {
  const { currentDialog, show, hide } = useDialog();
  const {
    connectionStatus: { type: connectionStatusType },
  } = useEVMContext();
  const isConnected = connectionStatusType === 'connected';
  const isDisconnected = connectionStatusType === 'disconnected';
  const prevConnectionStatusType = usePrevious(connectionStatusType);

  /**
   * Dismiss all dialogs when connectionStatusType transitions to 'disconnected'.
   * We do this in an effect instead of a disconnect handler because the user can disconnect through the wallet extension.
   *
   * The only caveat is that we don't want to hide dialogs when the user transitions from 'connecting'
   * (e.g. if user cancels connection, the status goes from 'connecting' to 'disconnected' but we want to keep Connect dialog open)
   */
  useEffect(() => {
    if (isDisconnected && prevConnectionStatusType !== 'connecting') {
      hide();
    }
  }, [hide, prevConnectionStatusType, isDisconnected]);

  /**
   * If the user hasn't completed onboarding, show the terms of use dialog
   * DURING BETA: wait to show this until after users are allowed into the app
   */
  const gatedBetaState = useAddressGatedBetaState();
  const { savedUserState } = useSavedUserState();
  const hasCompletedOnboarding = savedUserState.onboardingComplete;
  useEffect(() => {
    if (gatedBetaState !== 'access_allowed') {
      return;
    }
    if (isConnected && !hasCompletedOnboarding && !currentDialog) {
      show({
        type: 'terms_of_use',
        params: {},
      });
    }
  }, [
    currentDialog,
    gatedBetaState,
    hasCompletedOnboarding,
    isConnected,
    show,
  ]);

  /**
   * Show connect desktop wallet link dialog when the intent=desktopWalletLink query param is present.
   * This allows users who scan the mobile link QR code to automatically see the scanner dialog.
   */
  const searchParams = useSearchParams();
  const intentParam = searchParams.get('intent');

  useEffect(() => {
    if (
      isDisconnected &&
      !currentDialog &&
      intentParam === 'desktopWalletLink'
    ) {
      // If we don't delay the modal opening, the native prompt to enable camera disappears on iOS.
      // I couldn't figure out why.
      setTimeout(() => {
        show({
          type: 'connect_desktop_wallet_link',
          params: {},
        });
      }, 1000);
    }
  }, [intentParam, currentDialog, isDisconnected, show]);
}
