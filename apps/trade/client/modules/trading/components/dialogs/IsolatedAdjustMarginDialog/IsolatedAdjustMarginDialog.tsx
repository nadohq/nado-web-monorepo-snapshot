import { ActionSummary } from 'client/components/ActionSummary';
import { Form } from 'client/components/Form';
import { FractionAmountButtons } from 'client/components/FractionAmountButtons';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { IsolatedAdjustMarginDialogSummaryDisclosure } from 'client/modules/trading/components/dialogs/IsolatedAdjustMarginDialog/IsolatedAdjustMarginDialogSummaryDisclosure';
import { IsolatedAdjustMarginInputs } from 'client/modules/trading/components/dialogs/IsolatedAdjustMarginDialog/IsolatedAdjustMarginInputs/IsolatedAdjustMarginInputs';
import { IsolatedAdjustMarginModeControl } from 'client/modules/trading/components/dialogs/IsolatedAdjustMarginDialog/IsolatedAdjustMarginModeControl';
import { IsolatedAdjustMarginSubmitButton } from 'client/modules/trading/components/dialogs/IsolatedAdjustMarginDialog/IsolatedAdjustMarginSubmitButton';
import { useIsolatedAdjustMarginForm } from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/useIsolatedAdjustMarginForm';
import { useTranslation } from 'react-i18next';

export interface IsolatedAdjustMarginDialogParams {
  isoSubaccountName: string;
}

export function IsolatedAdjustMarginDialog({
  isoSubaccountName,
}: IsolatedAdjustMarginDialogParams) {
  const { hide } = useDialog();
  const { t } = useTranslation();
  const {
    form,
    isAddMargin,
    validAmount,
    maxWithdrawable,
    primaryQuoteToken,
    formError,
    enableBorrows,
    buttonState,
    validateAmount,
    onSubmit,
    onAdjustmentModeChange,
    onFractionSelected,
    onEnableBorrowsChange,
    onMaxAmountClicked,
  } = useIsolatedAdjustMarginForm({
    isoSubaccountName,
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.adjustMargin)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onSubmit}>
          <IsolatedAdjustMarginModeControl
            isAddMargin={isAddMargin}
            onAdjustmentModeChange={onAdjustmentModeChange}
          />
          <IsolatedAdjustMarginInputs
            enableBorrows={enableBorrows}
            form={form}
            formError={formError}
            isAddMargin={isAddMargin}
            maxWithdrawable={maxWithdrawable}
            onEnableBorrowsChange={onEnableBorrowsChange}
            onMaxAmountClicked={onMaxAmountClicked}
            primaryQuoteToken={primaryQuoteToken}
            validAmount={validAmount}
            validateAmount={validateAmount}
          />
          <FractionAmountButtons onFractionSelected={onFractionSelected} />
          <ActionSummary.Container>
            <IsolatedAdjustMarginDialogSummaryDisclosure
              primaryQuoteTokenSymbol={primaryQuoteToken.symbol}
              isAddMargin={isAddMargin}
              isoSubaccountName={isoSubaccountName}
              validAmount={validAmount}
            />
            <IsolatedAdjustMarginSubmitButton
              isAddMargin={isAddMargin}
              state={buttonState}
            />
          </ActionSummary.Container>
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
