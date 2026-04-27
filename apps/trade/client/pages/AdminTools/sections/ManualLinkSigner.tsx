'use client';

import { subaccountToHex } from '@nadohq/client';
import { safeParseForData, WithClassnames } from '@nadohq/web-common';
import { CompactInput, SectionedCard } from '@nadohq/web-ui';
import { useMutation } from '@tanstack/react-query';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { HANDLED_BUTTON_USER_STATE_ERRORS } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { ValidUserStatePrimaryButton } from 'client/components/ValidUserStatePrimaryButton/ValidUserStatePrimaryButton';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useRunWithDelayOnCondition } from 'client/hooks/util/useRunWithDelayOnCondition';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { addressValidator } from 'client/utils/inputValidators';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LinkSignerParams {
  signerAddress: string;
}

export function ManualLinkSigner({ className }: WithClassnames) {
  const { t } = useTranslation();

  const [signerAddress, setSignerAddress] = useState('');
  const { dispatchNotification } = useNotificationManagerContext();

  const validSignerAddress = safeParseForData(addressValidator, signerAddress);

  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: LinkSignerParams,
        context: ValidExecuteContext,
      ): Promise<void> => {
        await context.nadoClient.subaccount.linkSigner({
          signer: subaccountToHex({
            subaccountOwner: params.signerAddress,
            subaccountName: '',
          }),
          subaccountName: context.subaccount.name,
        });
      },
      [],
    ),
  );
  const { isPending, isSuccess, mutateAsync, reset } = useMutation({
    mutationFn,
  });

  const onSubmitClick = async () => {
    if (!validSignerAddress) {
      return;
    }

    const promise = mutateAsync({
      signerAddress: validSignerAddress,
    });
    dispatchNotification({
      type: 'action_error_handler',
      data: {
        errorNotificationTitle: t(($) => $.errors.linkSignerFailed),
        executionData: {
          serverExecutionResult: promise,
        },
      },
    });
  };

  const buttonContent = (() => {
    if (isPending) {
      return t(($) => $.buttons.linking);
    }
    if (isSuccess) {
      return (
        <ButtonStateContent.Success message={t(($) => $.buttons.linked)} />
      );
    }
    return t(($) => $.buttons.linkSigner);
  })();

  useRunWithDelayOnCondition({
    condition: isSuccess,
    fn: reset,
  });

  return (
    <SectionedCard className={className}>
      <SectionedCard.Header>
        {t(($) => $.manualLinkSigner.header)}
      </SectionedCard.Header>
      <SectionedCard.Content className="flex flex-col gap-y-3">
        <p className="text-sm">{t(($) => $.manualLinkSigner.description)}</p>
        <CompactInput
          value={signerAddress}
          onChange={(e) => setSignerAddress(e.target.value)}
          placeholder={t(($) => $.inputPlaceholders.linkedSignerAddress)}
          disabled={isPending}
        />
        <ValidUserStatePrimaryButton
          handledErrors={{
            ...HANDLED_BUTTON_USER_STATE_ERRORS.onlyIncorrectConnectedChain,
            not_connected: true,
          }}
          onClick={onSubmitClick}
          disabled={!validSignerAddress}
          isLoading={isPending}
        >
          {buttonContent}
        </ValidUserStatePrimaryButton>
      </SectionedCard.Content>
    </SectionedCard>
  );
}
