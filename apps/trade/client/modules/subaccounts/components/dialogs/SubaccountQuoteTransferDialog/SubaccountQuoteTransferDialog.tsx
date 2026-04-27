import { ActionSummary } from 'client/components/ActionSummary';
import { EnableBorrowsSwitch } from 'client/components/EnableBorrowsSwitch';
import { ErrorPanel } from 'client/components/ErrorPanel';
import { Form } from 'client/components/Form';
import { FractionAmountButtons } from 'client/components/FractionAmountButtons';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { SubaccountQuoteTransferAmountInput } from 'client/modules/subaccounts/components/dialogs/SubaccountQuoteTransferDialog/SubaccountQuoteTransferAmountInput';
import { SubaccountQuoteTransferInputSummary } from 'client/modules/subaccounts/components/dialogs/SubaccountQuoteTransferDialog/SubaccountQuoteTransferInputSummary';
import { SubaccountQuoteTransferOverviewCards } from 'client/modules/subaccounts/components/dialogs/SubaccountQuoteTransferDialog/SubaccountQuoteTransferOverviewCards';
import { SubaccountQuoteTransferSelect } from 'client/modules/subaccounts/components/dialogs/SubaccountQuoteTransferDialog/SubaccountQuoteTransferSelect';
import { SubaccountQuoteTransferSubmitButton } from 'client/modules/subaccounts/components/dialogs/SubaccountQuoteTransferDialog/SubaccountQuoteTransferSubmitButton';
import { SubaccountQuoteTransferSummaryDisclosure } from 'client/modules/subaccounts/components/dialogs/SubaccountQuoteTransferDialog/SubaccountQuoteTransferSummaryDisclosure';
import { useSubaccountQuoteTransferAmountErrorTooltipContent } from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/useSubaccountQuoteTransferAmountErrorTooltipContent';
import { useSubaccountQuoteTransferForm } from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/useSubaccountQuoteTransferForm';
import { useTranslation } from 'react-i18next';

export interface SubaccountQuoteTransferDialogParams {
  recipientSubaccountName?: string;
}

export function SubaccountQuoteTransferDialog({
  recipientSubaccountName,
}: SubaccountQuoteTransferDialogParams) {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const {
    form,
    formError,
    hasSameSubaccountError,
    amountInputValueUsd,
    validateAmount,
    onFractionSelected,
    onEnableBorrowsChange,
    enableBorrows,
    decimalAdjustedMaxWithdrawableWithFee,
    subaccounts,
    senderSubaccount,
    recipientSubaccount,
    currentSubaccount,
    primaryQuoteToken,
    senderEstimateStateTxs,
    recipientEstimateStateTxs,
    senderQuoteBalanceDelta,
    recipientQuoteBalanceDelta,
    buttonState,
    onSwapAccounts,
    onSubmit,
  } = useSubaccountQuoteTransferForm({ recipientSubaccountName });

  const { register, setValue } = form;
  const primaryQuoteTokenSymbol = primaryQuoteToken.symbol;

  const amountErrorTooltipContent =
    useSubaccountQuoteTransferAmountErrorTooltipContent({
      formError,
    });

  const amountPlaceholder = useNumericInputPlaceholder({
    decimals: primaryQuoteToken.tokenDecimals,
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.transferFunds)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onSubmit}>
          <div className="grid grid-cols-2 text-left">
            <SubaccountQuoteTransferSelect
              id="senderSubaccountName"
              form={form}
              subaccounts={subaccounts}
              selectedSubaccount={senderSubaccount}
            />
            <SubaccountQuoteTransferSelect
              id="recipientSubaccountName"
              form={form}
              subaccounts={subaccounts}
              selectedSubaccount={recipientSubaccount}
            />
          </div>
          <SubaccountQuoteTransferOverviewCards
            currentSubaccount={currentSubaccount}
            senderSubaccount={senderSubaccount}
            recipientSubaccount={recipientSubaccount}
            primaryQuoteToken={primaryQuoteToken}
            onSwapAccounts={onSwapAccounts}
          />
          {hasSameSubaccountError && (
            <ErrorPanel>
              {t(($) => $.errors.cannotTransferToSameAccount)}
            </ErrorPanel>
          )}
          <div className="flex flex-col gap-y-5">
            <EnableBorrowsSwitch
              enableBorrows={enableBorrows}
              onEnableBorrowsChange={onEnableBorrowsChange}
            />
            <div className="flex flex-col gap-y-3">
              <SubaccountQuoteTransferAmountInput
                {...register('amount', { validate: validateAmount })}
                placeholder={amountPlaceholder}
                estimatedValueUsd={amountInputValueUsd}
                error={amountErrorTooltipContent}
                primaryQuoteToken={primaryQuoteToken}
                onFocus={() => setValue('amountSource', 'absolute')}
              />
              <SubaccountQuoteTransferInputSummary
                decimalAdjustedMaxWithdrawableWithFee={
                  decimalAdjustedMaxWithdrawableWithFee
                }
                enableBorrows={enableBorrows}
                onFractionSelected={onFractionSelected}
                symbol={primaryQuoteTokenSymbol}
              />
            </div>
          </div>
          <FractionAmountButtons onFractionSelected={onFractionSelected} />
          <ActionSummary.Container>
            <SubaccountQuoteTransferSummaryDisclosure
              senderEstimateStateTxs={senderEstimateStateTxs}
              recipientEstimateStateTxs={recipientEstimateStateTxs}
              senderQuoteBalanceDelta={senderQuoteBalanceDelta}
              recipientQuoteBalanceDelta={recipientQuoteBalanceDelta}
              symbol={primaryQuoteTokenSymbol}
              senderSubaccount={senderSubaccount}
              recipientSubaccount={recipientSubaccount}
            />
            <SubaccountQuoteTransferSubmitButton state={buttonState} />
          </ActionSummary.Container>
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
