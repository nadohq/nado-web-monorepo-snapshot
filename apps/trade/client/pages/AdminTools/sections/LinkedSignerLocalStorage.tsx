'use client';

import { useSubaccountContext } from '@nadohq/react-client';
import { safeParseForData, WithClassnames } from '@nadohq/web-common';
import { CompactInput, SecondaryButton, SectionedCard } from '@nadohq/web-ui';
import { useCanUserExecute } from 'client/hooks/subaccount/useCanUserExecute';
import { privateKeyValidator } from 'client/utils/inputValidators';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { privateKeyToAccount } from 'viem/accounts';

export function LinkedSignerLocalStorage({ className }: WithClassnames) {
  const { t } = useTranslation();

  const canExecute = useCanUserExecute();
  const { signingPreference } = useSubaccountContext();

  const removeLinkedSignerForSession = () => {
    signingPreference.update({
      type: 'sign_always',
    });
  };

  const [customLinkedSignerPrivateKey, setCustomLinkedSignerPrivateKey] =
    useState('');
  const validatedPrivateKey = safeParseForData(
    privateKeyValidator,
    customLinkedSignerPrivateKey,
  );
  const setCustomLinkedSigner = () => {
    if (!validatedPrivateKey) {
      return;
    }
    signingPreference.update({
      type: 'sign_once',
      savePrivateKey: true,
      linkedSigner: {
        privateKey: validatedPrivateKey,
        account: privateKeyToAccount(validatedPrivateKey),
      },
    });
  };

  return (
    <SectionedCard className={className}>
      <SectionedCard.Header>
        {t(($) => $.linkedSignerLocalStorage.header)}
      </SectionedCard.Header>
      <SectionedCard.Content className="flex flex-col gap-y-3">
        <p className="text-sm">
          {t(($) => $.linkedSignerLocalStorage.turnOffDescription)}
        </p>
        <SecondaryButton
          disabled={!canExecute}
          onClick={removeLinkedSignerForSession}
        >
          {t(($) => $.buttons.turnOffOneClickTradingForSession)}
        </SecondaryButton>

        <p className="text-sm">
          {t(($) => $.linkedSignerLocalStorage.customSignerDescription)}
        </p>
        <CompactInput
          placeholder={t(($) => $.inputPlaceholders.privateKeyHex)}
          value={customLinkedSignerPrivateKey}
          onChange={(e) => setCustomLinkedSignerPrivateKey(e.target.value)}
        />
        <SecondaryButton
          disabled={!canExecute || !validatedPrivateKey}
          onClick={setCustomLinkedSigner}
        >
          {t(($) => $.linkedSignerLocalStorage.updateButton)}
        </SecondaryButton>
      </SectionedCard.Content>
    </SectionedCard>
  );
}
