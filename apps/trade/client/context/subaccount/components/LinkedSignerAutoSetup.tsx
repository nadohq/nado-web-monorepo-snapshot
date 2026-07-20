import { asyncResult } from '@nadohq/client';
import { useSubaccountContext } from '@nadohq/react-client';
import { useIsEmbeddedWallet } from 'client/context/wagmi/useIsEmbeddedWallet';
import { useExecuteUpdateLinkedSigner } from 'client/hooks/execute/useExecuteUpdateLinkedSigner';
import { useRequiresInitialDeposit } from 'client/hooks/subaccount/useRequiresInitialDeposit';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';

export function LinkedSignerAutoSetup() {
  const isEmbeddedWallet = useIsEmbeddedWallet();
  const requiresInitialDeposit = useRequiresInitialDeposit();
  const isSingleSignatureSession = useIsSingleSignatureSession({
    requireActive: true,
  });
  const { signingPreference } = useSubaccountContext();
  const executeUpdateLinkedSigner = useExecuteUpdateLinkedSigner();

  useRunWithDelayOnCondition({
    condition:
      isEmbeddedWallet && !requiresInitialDeposit && !isSingleSignatureSession,
    // at least DEFAULT delay is required for eventual consistency to settle initial deposit
    // on backend side when creating a new subaccount with a transfer from existing subaccount.
    // SHORT delay is _not enough_ as it intermittently (~50%) results in:
    // EngineServerFailureError 2024: The provided address has no previous deposits.
    delay: RUN_WITH_DELAY_DURATIONS.DEFAULT,
    fn: async () => {
      const executeUpdateLinkedSignerPromise =
        executeUpdateLinkedSigner.mutateAsync({
          revoke: false,
        });

      const [linkedSigner, error] = await asyncResult(
        executeUpdateLinkedSignerPromise,
      );
      if (error) {
        console.error(
          '[LinkedSignerAutoSetup] Failed to update linked signer:',
          error,
        );
        return;
      }

      if (linkedSigner) {
        signingPreference.update({
          type: 'sign_once',
          linkedSigner,
          savePrivateKey: true,
        });
      }
    },
  });

  return null;
}
