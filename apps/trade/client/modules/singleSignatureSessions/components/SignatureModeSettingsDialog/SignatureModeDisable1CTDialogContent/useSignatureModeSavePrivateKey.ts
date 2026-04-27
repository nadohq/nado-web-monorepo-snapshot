import { asyncResult } from '@nadohq/client';
import { useSubaccountContext } from '@nadohq/react-client';
import { useExecuteUpdateLinkedSigner } from 'client/hooks/execute/useExecuteUpdateLinkedSigner';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useSignatureModeSavePrivateKey() {
  const { t } = useTranslation();
  const { dispatchNotification } = useNotificationManagerContext();
  // This execute will skip the engine API call if the derived wallet matches backend
  const executeUpdateLinkedSigner = useExecuteUpdateLinkedSigner();
  const { signingPreference } = useSubaccountContext();
  const [savePrivateKey, setSavePrivateKey] = useState(true);

  // Sync save private key state
  useEffect(() => {
    if (signingPreference.current?.type !== 'sign_once') {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- we want to sync the save private key state when the signing preference changes
    setSavePrivateKey(signingPreference.current?.savePrivateKey ?? true);
  }, [signingPreference]);

  // Show button if settings have changed from initial state
  const showSaveRememberApprovalButton = useMemo(() => {
    if (signingPreference.current?.type !== 'sign_once') {
      return false;
    }
    return signingPreference.current?.savePrivateKey !== savePrivateKey;
  }, [savePrivateKey, signingPreference]);

  const onSubmit = useCallback(async () => {
    const mutationResultPromise = executeUpdateLinkedSigner.mutateAsync({
      revoke: false,
    });

    dispatchNotification({
      type: 'action_error_handler',
      data: {
        errorNotificationTitle: t(($) => $.errors.saveFailed),
        executionData: {
          serverExecutionResult: mutationResultPromise,
        },
      },
    });

    // In this case, we actually care about the returned data, so await the result
    const [linkedSigner] = await asyncResult(mutationResultPromise);
    if (linkedSigner) {
      signingPreference.update({
        type: 'sign_once',
        linkedSigner,
        savePrivateKey,
      });
    }
  }, [
    dispatchNotification,
    executeUpdateLinkedSigner,
    savePrivateKey,
    signingPreference,
    t,
  ]);

  const buttonState: BaseActionButtonState = (() => {
    switch (executeUpdateLinkedSigner.status) {
      case 'pending':
        return 'loading';
      default:
        return 'idle';
    }
  })();

  return {
    savePrivateKey,
    setSavePrivateKey,
    buttonState,
    onSubmit,
    showSaveRememberApprovalButton,
  };
}
