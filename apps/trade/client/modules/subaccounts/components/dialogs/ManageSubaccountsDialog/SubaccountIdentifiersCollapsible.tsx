import {
  Subaccount,
  subaccountNameBytesToStr,
  subaccountNameToBytes12,
  subaccountToHex,
} from '@nadohq/client';
import { Icons, TextButton } from '@nadohq/web-ui';
import * as Collapsible from '@radix-ui/react-collapsible';
import { SubaccountIdentifierField } from 'client/modules/subaccounts/components/dialogs/ManageSubaccountsDialog/SubaccountIdentifierField';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Displays API identifiers for a subaccount in an expandable section with copy functionality.
 */
export function SubaccountIdentifiersCollapsible({
  subaccountName,
  subaccountOwner,
}: Subaccount) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const formattedSubaccountName = subaccountNameBytesToStr(
    subaccountNameToBytes12(subaccountName),
  );
  const subaccountHex = subaccountToHex({
    subaccountOwner,
    subaccountName,
  });

  return (
    <Collapsible.Root
      className="flex flex-col gap-y-2"
      open={open}
      onOpenChange={setOpen}
    >
      <Collapsible.Trigger asChild>
        <TextButton
          colorVariant="tertiary"
          className="justify-center text-xs"
          endIcon={<Icons.Info size={16} />}
        >
          {t(($) => $.apiIdentifiers)}
        </TextButton>
      </Collapsible.Trigger>
      <Collapsible.Content className="flex flex-col gap-y-3">
        <SubaccountIdentifierField
          label={t(($) => $.subaccountName)}
          value={formattedSubaccountName}
        />
        <SubaccountIdentifierField
          label={t(($) => $.subaccount)}
          value={subaccountHex}
          valueClassName="break-all"
        />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
