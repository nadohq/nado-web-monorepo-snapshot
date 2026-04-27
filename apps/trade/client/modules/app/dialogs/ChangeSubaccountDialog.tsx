import { useSubaccountContext } from '@nadohq/react-client';
import { CompactInput, Input, PrimaryButton } from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ChangeSubaccountDialog() {
  const { hide } = useDialog();
  const { t } = useTranslation();

  const {
    currentSubaccount: { name: currentSubaccountName },
    setCurrentSubaccountName,
  } = useSubaccountContext();

  const [subaccountNameInput, setSubaccountNameInput] = useState(
    currentSubaccountName,
  );

  const cleanedSubaccountName = subaccountNameInput.trim();

  const onSaveClicked = () => {
    setCurrentSubaccountName(cleanedSubaccountName);
    hide();
  };

  const subaccountField = (
    <div className="flex flex-col gap-y-2">
      <Input.Label className="text-xs" htmlFor="subaccountName">
        {t(($) => $.subaccountName)}
      </Input.Label>
      <CompactInput
        name="subaccountName"
        value={subaccountNameInput}
        placeholder={t(($) => $.inputPlaceholders.enterName)}
        onChange={(e) => setSubaccountNameInput(e.target.value)}
      />
    </div>
  );

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.subaccount)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        {subaccountField}
        <PrimaryButton onClick={onSaveClicked}>
          {t(($) => $.buttons.save)}
        </PrimaryButton>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
