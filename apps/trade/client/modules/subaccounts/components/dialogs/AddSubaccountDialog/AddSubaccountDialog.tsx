import {
  getAppSubaccountName,
  useSubaccountContext,
} from '@nadohq/react-client';
import {
  Divider,
  LinkButton,
  PrimaryButton,
  SecondaryButton,
} from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { AddSubaccountDialogStepHeader } from 'client/modules/subaccounts/components/dialogs/AddSubaccountDialog/AddSubaccountDialogStepHeader';
import { SubaccountProfileFormInputs } from 'client/modules/subaccounts/components/dialogs/EditSubaccountProfileDialog/SubaccountProfileFormInputs';
import { useSubaccountProfileForm } from 'client/modules/subaccounts/hooks/useSubaccountProfileForm';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function AddSubaccountDialog() {
  const { t } = useTranslation();
  const { appSubaccountNames, setCurrentSubaccountName } =
    useSubaccountContext();
  const { hide, show } = useDialog();

  const subaccountName = getAppSubaccountName(appSubaccountNames.length);

  const onSubmit = useCallback(() => {
    setCurrentSubaccountName(subaccountName);
  }, [setCurrentSubaccountName, subaccountName]);

  const {
    form,
    formError,
    watchedUsername,
    watchedAvatar,
    handleSubmit,
    validateUsername,
    profileSubaccountName,
    ensAvatar,
  } = useSubaccountProfileForm({
    subaccountName,
    onSubmit,
    isNewSubaccount: true,
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title
        onClose={hide}
        endElement={
          <LinkButton
            className="text-sm"
            colorVariant="secondary"
            as={Link}
            href={LINKS.multipleSubaccountsDocs}
            withExternalIcon
            external
          >
            {t(($) => $.buttons.docs)}
          </LinkButton>
        }
      >
        {t(($) => $.dialogTitles.addAccount)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <AddSubaccountDialogStepHeader
          stepNumber={1}
          heading={t(($) => $.addAccountDialog.step1.heading)}
        />
        <SubaccountProfileFormInputs
          form={form}
          formError={formError}
          watchedUsername={watchedUsername}
          watchedAvatar={watchedAvatar}
          validateUsername={validateUsername}
          profileSubaccountName={profileSubaccountName}
          ensAvatar={ensAvatar}
        />
        <Divider />
        <AddSubaccountDialogStepHeader
          stepNumber={2}
          heading={t(($) => $.addAccountDialog.step2.heading)}
          description={t(($) => $.addAccountDialog.step2.description)}
        />
        <div className="flex flex-col gap-y-3">
          <PrimaryButton
            onClick={() => {
              handleSubmit();
              show({ type: 'deposit_options', params: {} });
            }}
          >
            {t(($) => $.buttons.depositFunds)}
          </PrimaryButton>
          <SecondaryButton
            onClick={() => {
              handleSubmit();
              show({
                type: 'subaccount_quote_transfer',
                params: { recipientSubaccountName: subaccountName },
              });
            }}
          >
            {t(($) => $.addAccountDialog.transferFromAnotherAccount)}
          </SecondaryButton>
        </div>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
