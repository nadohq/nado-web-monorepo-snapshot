import { Form } from 'client/components/Form';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { EditSubaccountProfileActionButtons } from 'client/modules/subaccounts/components/dialogs/EditSubaccountProfileDialog/EditSubaccountProfileActionButtons';
import { SubaccountProfileFormInputs } from 'client/modules/subaccounts/components/dialogs/EditSubaccountProfileDialog/SubaccountProfileFormInputs';
import { SubaccountIdentifiersCollapsible } from 'client/modules/subaccounts/components/dialogs/ManageSubaccountsDialog/SubaccountIdentifiersCollapsible';
import { useSubaccountProfileForm } from 'client/modules/subaccounts/hooks/useSubaccountProfileForm';
import { useTranslation } from 'react-i18next';

export interface EditSubaccountProfileDialogParams {
  subaccountName?: string;
}

export function EditSubaccountProfileDialog({
  subaccountName,
}: EditSubaccountProfileDialogParams) {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const {
    form,
    formError,
    watchedUsername,
    watchedAvatar,
    handleSubmit,
    validateUsername,
    profileSubaccountName,
    currentSubaccountAddress,
    resetChanges,
    isFormDirty,
    ensAvatar,
  } = useSubaccountProfileForm({ subaccountName });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.editAccount)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
          <SubaccountProfileFormInputs
            form={form}
            formError={formError}
            watchedUsername={watchedUsername}
            watchedAvatar={watchedAvatar}
            validateUsername={validateUsername}
            profileSubaccountName={profileSubaccountName}
            ensAvatar={ensAvatar}
            showProfilePreview
          />
          <div className="flex flex-col gap-y-2">
            <EditSubaccountProfileActionButtons
              resetChanges={resetChanges}
              isFormDirty={isFormDirty}
            />
            {currentSubaccountAddress && (
              <SubaccountIdentifiersCollapsible
                subaccountName={profileSubaccountName}
                subaccountOwner={currentSubaccountAddress}
              />
            )}
          </div>
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
