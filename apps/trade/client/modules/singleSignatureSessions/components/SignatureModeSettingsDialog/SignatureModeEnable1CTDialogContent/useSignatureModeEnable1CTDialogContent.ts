import { asyncResult } from '@nadohq/client';
import {
  useQuerySubaccountLinkedSigner,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useExecuteCreateLinkedSignerKey } from 'client/hooks/execute/useExecuteCreateLinkedSignerKey';
import { useExecuteUpdateLinkedSigner } from 'client/hooks/execute/useExecuteUpdateLinkedSigner';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useRequiresSingleSignatureSetup } from 'client/modules/singleSignatureSessions/hooks/useRequiresSingleSignatureSetup';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type SignatureModeSettingsUserStateError =
  // Hit rate limit for enabling single signature
  | 'out_of_switches'
  // 5 USDT of account value required to enable single signature
  | 'below_minimum_value';

interface Params {
  onEnableSuccess(): void;
}

export function useSignatureModeEnable1CTDialogContent({
  onEnableSuccess,
}: Params) {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const { dispatchNotification } = useNotificationManagerContext();
  const { signingPreference } = useSubaccountContext();
  const executeCreateLinkedSignerKey = useExecuteCreateLinkedSignerKey();
  const executeUpdateLinkedSigner = useExecuteUpdateLinkedSigner();
  const requiresSingleSignatureSetup = useRequiresSingleSignatureSetup();

  useRunWithDelayOnCondition({
    condition: executeUpdateLinkedSigner.isSuccess,
    fn: () => {
      executeCreateLinkedSignerKey.reset();
      executeUpdateLinkedSigner.reset();
      onEnableSuccess();
    },
    delay: RUN_WITH_DELAY_DURATIONS.SHORT,
  });

  const { data: currentServerLinkedSigner } = useQuerySubaccountLinkedSigner();
  const { data: subaccountOverview } = useSubaccountOverview();

  // Form state
  const [savePrivateKey, setSavePrivateKey] = useState(true);

  // Sync save private key state
  useEffect(() => {
    if (signingPreference.current?.type !== 'sign_once') {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- we want to sync the save private key state when the signing preference changes
    setSavePrivateKey(signingPreference.current?.savePrivateKey ?? true);
  }, [signingPreference]);

  const numSwitchesRemaining =
    currentServerLinkedSigner?.remainingTxs.toNumber();

  const userStateError = useMemo(():
    | SignatureModeSettingsUserStateError
    | undefined => {
    // When user is out of switches, they can't enable single signature
    // Display the error, and disable the button
    if (numSwitchesRemaining === 0) {
      return 'out_of_switches';
    }
    // Technically it's 5 USDT, but use USD here. There's also a backend rounding error for balances, so we check for just under 5
    if (subaccountOverview?.portfolioValueUsd.lt(4.99)) {
      return 'below_minimum_value';
    }
  }, [numSwitchesRemaining, subaccountOverview?.portfolioValueUsd]);

  // Step 1: Create the signing key
  const onSubmitCreateKey = useCallback(async () => {
    const mutationResultPromise = executeCreateLinkedSignerKey.mutateAsync({});

    dispatchNotification({
      type: 'action_error_handler',
      data: {
        errorNotificationTitle: t(($) => $.errors.enable1CTFailed),
        executionData: {
          serverExecutionResult: mutationResultPromise,
        },
      },
    });

    await asyncResult(mutationResultPromise);
  }, [dispatchNotification, executeCreateLinkedSignerKey, t]);

  // Step 2: Link the signer on-chain (no-ops if already linked)
  const onSubmitLink = useCallback(async () => {
    if (!executeCreateLinkedSignerKey.data) {
      return;
    }

    const mutationResultPromise = executeUpdateLinkedSigner.mutateAsync({
      revoke: false,
      linkedSigner: executeCreateLinkedSignerKey.data,
    });

    dispatchNotification({
      type: 'action_error_handler',
      data: {
        errorNotificationTitle: t(($) => $.errors.enable1CTFailed),
        executionData: {
          serverExecutionResult: mutationResultPromise,
        },
      },
    });

    // In this case, we actually care about the returned data, so await the result
    const [linkedSigner, executeError] = await asyncResult(
      mutationResultPromise,
    );

    // Only update state if success
    if (executeError) {
      return;
    }

    if (linkedSigner) {
      signingPreference.update({
        type: 'sign_once',
        linkedSigner,
        savePrivateKey,
      });
    }
  }, [
    dispatchNotification,
    executeCreateLinkedSignerKey.data,
    executeUpdateLinkedSigner,
    savePrivateKey,
    signingPreference,
    t,
  ]);

  // The create key button is only clickable in the idle state.
  // All other states disable it on the UI side (via `disabled={buttonState !== 'idle'}`):
  // - 'success': key already created, button shows confirmation and is disabled
  // - 'disabled': user state error (e.g. out of switches, below minimum account value)
  // - 'loading': key creation in progress
  const createKeyButtonState = useMemo((): BaseActionButtonState => {
    if (executeCreateLinkedSignerKey.isSuccess) {
      return 'success';
    }
    if (!!userStateError) {
      return 'disabled';
    }
    if (executeCreateLinkedSignerKey.isPending) {
      return 'loading';
    }
    return 'idle';
  }, [
    executeCreateLinkedSignerKey.isSuccess,
    executeCreateLinkedSignerKey.isPending,
    userStateError,
  ]);

  const linkButtonState = useMemo((): BaseActionButtonState => {
    if (executeUpdateLinkedSigner.isSuccess) {
      return 'success';
    }
    if (executeUpdateLinkedSigner.isPending) {
      return 'loading';
    }
    // Disabled until the signing key has been created
    if (!executeCreateLinkedSignerKey.data) {
      return 'disabled';
    }
    return 'idle';
  }, [
    executeCreateLinkedSignerKey.data,
    executeUpdateLinkedSigner.isPending,
    executeUpdateLinkedSigner.isSuccess,
  ]);

  const skipSignOnceSuggestion = useCallback(() => {
    signingPreference.update({
      type: 'sign_always',
    });

    hide();
  }, [hide, signingPreference]);

  const disableInputs =
    executeCreateLinkedSignerKey.isPending ||
    executeUpdateLinkedSigner.isPending ||
    executeUpdateLinkedSigner.isSuccess;

  return {
    savePrivateKey,
    setSavePrivateKey,
    userStateError,
    createKeyButtonState,
    linkButtonState,
    requiresSingleSignatureSetup,
    disableInputs,
    onSubmitCreateKey,
    onSubmitLink,
    skipSignOnceSuggestion,
  };
}
