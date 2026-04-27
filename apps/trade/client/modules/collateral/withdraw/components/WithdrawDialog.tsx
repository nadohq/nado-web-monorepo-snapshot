import { ButtonHelperInfo, LinkButton } from '@nadohq/web-ui';
import { ActionSummary } from 'client/components/ActionSummary';
import { EnableBorrowsSwitch } from 'client/components/EnableBorrowsSwitch';
import { Form } from 'client/components/Form';
import { FractionAmountButtons } from 'client/components/FractionAmountButtons';
import { usePushHistoryPage } from 'client/hooks/ui/navigation/usePushHistoryPage';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { CollateralSelectInput } from 'client/modules/collateral/components/CollateralSelectInput';
import { DelayedWithdrawalWarning } from 'client/modules/collateral/components/DelayedWithdrawalWarning';
import { SlowMode1CTSetupPrompt } from 'client/modules/collateral/components/SlowMode1CTSetupPrompt';
import { BorrowingFundsDismissible } from 'client/modules/collateral/withdraw/components/BorrowingFundsDismissible';
import { WithdrawButton } from 'client/modules/collateral/withdraw/components/WithdrawButton';
import { WithdrawInputSummary } from 'client/modules/collateral/withdraw/components/WithdrawInputSummary';
import { WithdrawSummaryDisclosure } from 'client/modules/collateral/withdraw/components/WithdrawSummaryDisclosure';
import { useWithdrawAmountErrorTooltipContent } from 'client/modules/collateral/withdraw/hooks/useWithdrawAmountErrorTooltipContent';
import { useWithdrawForm } from 'client/modules/collateral/withdraw/hooks/useWithdrawForm';
import { useTranslation } from 'react-i18next';

export interface WithdrawDialogParams {
  initialProductId?: number;
}

interface Props extends WithdrawDialogParams {
  defaultEnableBorrows: boolean;
}

export function WithdrawDialog({
  defaultEnableBorrows,
  initialProductId,
}: Props) {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const pushHistoryPage = usePushHistoryPage();
  const {
    formError,
    suggestBorrowing,
    showGasWarning,
    showOneClickTradingPrompt,
    selectedProduct,
    selectedProductMaxWithdrawable,
    availableProducts,
    buttonState,
    estimateStateTxs,
    form,
    amountInputValueUsd,
    enableBorrows,
    onEnableBorrowsChange,
    validateAmount,
    onFractionSelected,
    onMaxAmountSelected,
    onSubmit,
  } = useWithdrawForm({ defaultEnableBorrows, initialProductId });

  const amountErrorTooltipContent = useWithdrawAmountErrorTooltipContent({
    formError,
    suggestBorrowing,
  });

  const amountPlaceholder = useNumericInputPlaceholder();

  const dialogTitle = enableBorrows
    ? t(($) => $.dialogTitles.borrowAndWithdraw)
    : t(($) => $.dialogTitles.withdraw);

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>{dialogTitle}</BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onSubmit}>
          <BorrowingFundsDismissible enableBorrows={enableBorrows} />
          {showOneClickTradingPrompt && <SlowMode1CTSetupPrompt />}
          <EnableBorrowsSwitch
            enableBorrows={enableBorrows}
            onEnableBorrowsChange={onEnableBorrowsChange}
          />
          <div className="flex flex-col gap-y-1.5">
            <CollateralSelectInput
              {...form.register('amount', {
                validate: validateAmount,
              })}
              dataTestId="withdraw-amount-input"
              placeholder={amountPlaceholder}
              onFocus={() => form.setValue('amountSource', 'absolute')}
              estimatedValueUsd={amountInputValueUsd}
              selectProps={{
                selectedProduct,
                availableProducts,
                assetAmountTitle: t(($) => $.balance),
                onProductSelected: (productId) => {
                  // Skip validation and other states as you can only select from available options
                  form.setValue('productId', productId);
                },
              }}
              error={amountErrorTooltipContent}
            />
            <WithdrawInputSummary
              enableBorrows={enableBorrows}
              selectedProductMaxWithdrawable={selectedProductMaxWithdrawable}
              onMaxAmountSelected={onMaxAmountSelected}
            />
          </div>
          <FractionAmountButtons onFractionSelected={onFractionSelected} />
          {showGasWarning && <DelayedWithdrawalWarning />}
          <ButtonHelperInfo.Container>
            <ActionSummary.Container>
              <WithdrawSummaryDisclosure
                estimateStateTxs={estimateStateTxs}
                enableBorrows={enableBorrows}
                feeAmount={selectedProduct?.fee?.amount}
                productId={selectedProduct?.productId}
                symbol={selectedProduct?.symbol}
                isHighlighted={buttonState === 'idle'}
              />
              <WithdrawButton
                state={buttonState}
                enableBorrows={enableBorrows}
              />
            </ActionSummary.Container>
            {buttonState === 'success' && (
              <ButtonHelperInfo.Content>
                {t(($) => $.withdrawalsSubmittedOnChainOnceGasThresholdReached)}{' '}
                <LinkButton
                  colorVariant="secondary"
                  className="w-max self-start"
                  onClick={() => {
                    pushHistoryPage('withdrawals');
                    // Hide dialog when link is clicked
                    hide();
                  }}
                  dataTestId="withdraw-track-status-button"
                >
                  {t(($) => $.buttons.trackStatus)}
                </LinkButton>
              </ButtonHelperInfo.Content>
            )}
          </ButtonHelperInfo.Container>
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
