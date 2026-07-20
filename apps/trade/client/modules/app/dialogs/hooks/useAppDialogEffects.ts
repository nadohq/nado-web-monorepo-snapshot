import { useEVMContext } from '@nadohq/react-client';
import { usePrevious } from 'ahooks';
import { useMultiWagmi } from 'client/context/wagmi/useMultiWagmi';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useFuulReferralsContext } from 'client/modules/referrals/FuulReferralsContext';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

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
  const { switchWagmiProvider } = useMultiWagmi();

  /**
   * Radix sets `pointer-events: none` on <body> while a modal dialog is open and
   * removes it during its own close transition. Our dialogs are unmounted on
   * dismiss rather than closed through that transition, so the cleanup can be
   * skipped — leaving the style stuck and freezing the whole page. Once no dialog
   * is open, restore pointer events on the next tick.
   *
   * https://github.com/radix-ui/primitives/issues/3645#issuecomment-3233998358
   */
  useEffect(() => {
    if (currentDialog) {
      return;
    }
    // The timeout is necessary so this runs after the dialog has fully unmounted,
    // otherwise Radix may re-apply `pointer-events: none` after we clear it.
    const timeoutId = setTimeout(() => {
      // Only undo Radix's stuck `pointer-events: none`; leave any other inline
      // value alone.
      if (document.body.style.pointerEvents === 'none') {
        document.body.style.pointerEvents = '';
      }
    }, 1);

    return () => clearTimeout(timeoutId);
  }, [currentDialog]);

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
   */
  const { savedUserState } = useSavedUserState();
  const hasCompletedOnboarding = savedUserState.onboardingComplete;
  useEffect(() => {
    if (isConnected && !hasCompletedOnboarding && !currentDialog) {
      show({
        type: 'terms_of_use',
        params: {},
      });
    }
  }, [currentDialog, hasCompletedOnboarding, isConnected, show]);

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
      switchWagmiProvider('wagmi');

      // If we don't delay the modal opening, the native prompt to enable camera disappears on iOS.
      // I couldn't figure out why.
      setTimeout(() => {
        show({
          type: 'connect_desktop_wallet_link',
          params: {},
        });
      }, 1000);
    }
  }, [intentParam, currentDialog, isDisconnected, show, switchWagmiProvider]);

  /**
   * Auto-show referral code dialog when user arrives via a referral link (?join=CODE),
   * is connected, and has completed onboarding. The session-scoped ref ensures this
   * fires at most once per page load — without it, closing the dialog would re-trigger
   * the effect (currentDialog flips back to null while referralCodeForSession is still
   * set), trapping the user in a modal loop.
   */
  const { referralCodeForSession } = useFuulReferralsContext();
  const didShowReferralsDialogRef = useRef(false);

  useEffect(() => {
    if (
      isConnected &&
      hasCompletedOnboarding &&
      !currentDialog &&
      referralCodeForSession &&
      !didShowReferralsDialogRef.current
    ) {
      show({
        type: 'enter_referral_code',
        params: {},
      });
      didShowReferralsDialogRef.current = true;
    }
  }, [
    currentDialog,
    hasCompletedOnboarding,
    isConnected,
    referralCodeForSession,
    show,
  ]);
}
