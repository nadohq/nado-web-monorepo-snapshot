import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { TextButton } from '@nadohq/web-ui';
import { ActionSummary } from 'client/components/ActionSummary';
import { Form } from 'client/components/Form';
import { InputSummaryItem } from 'client/components/InputSummaryItem';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { CollateralSelectInput } from 'client/modules/collateral/components/CollateralSelectInput';
import { DepositSummaryDisclosure } from 'client/modules/collateral/components/DepositSummaryDisclosure';
import { MaxRepayDismissible } from 'client/modules/collateral/repay/components/MaxRepayDismissible';
import { RepayConversionRateDisplay } from 'client/modules/collateral/repay/components/RepayConversionRateDisplay';
import { RepayConvertButton } from 'client/modules/collateral/repay/components/RepayConvertButton';
import { RepayConvertDismissible } from 'client/modules/collateral/repay/components/RepayConvertDismissible';
import { RepayConvertFormErrorPanel } from 'client/modules/collateral/repay/components/RepayConvertFormErrorPanel';
import { RepayConvertInputWrapper } from 'client/modules/collateral/repay/components/RepayConvertInputWrapper';
import { useRepayConvertForm } from 'client/modules/collateral/repay/hooks/useRepayConvertForm/useRepayConvertForm';
import { useRepayConvertReplayAmountErrorTooltipContent } from 'client/modules/collateral/repay/hooks/useRepayConvertForm/useRepayConvertReplayAmountErrorTooltipContent';
import { useTranslation } from 'react-i18next';

export function RepayConvertTab({
  initialProductId,
}: {
  initialProductId: number | undefined;
}) {
  const { t } = useTranslation();
  const {
    form,
    amountInputError,
    formError,
    availableRepayProducts,
    availableSourceProducts,
    isMaxRepayDismissibleOpen,
    disableMaxRepayButton,
    selectedRepayProduct,
    selectedSourceProduct,
    oracleConversionPrice,
    market,
    estimateStateTxs,
    buttonState,
    repayAmountValueUsd,
    maxRepaySize,
    sizeIncrement,
    onMaxRepayClicked,
    onAmountBorrowingClicked,
    onSubmit,
    validateRepayAmount,
    sourceAmount,
    sourceAmountValueUsd,
  } = useRepayConvertForm({
    initialProductId,
  });

  const amountPlaceholder = useNumericInputPlaceholder();

  const repayAmountErrorTooltipContent =
    useRepayConvertReplayAmountErrorTooltipContent({
      amountInputError,
      sizeIncrement,
    });

  return (
    <Form onSubmit={onSubmit} className="flex w-full flex-col gap-y-4">
      <div className="flex flex-col gap-y-2.5">
        <RepayConvertDismissible />
        {isMaxRepayDismissibleOpen && <MaxRepayDismissible />}
        {/*Amount input*/}
        <div className="flex flex-col gap-y-5">
          <RepayConvertInputWrapper
            labelContent={
              <div className="flex items-center justify-between">
                <p>{t(($) => $.repay)}</p>
                <TextButton
                  colorVariant="accent"
                  className="text-xs"
                  onClick={onMaxRepayClicked}
                  disabled={disableMaxRepayButton}
                >
                  {t(($) => $.buttons.maxRepay)}
                </TextButton>
              </div>
            }
          >
            <CollateralSelectInput
              {...form.register('repayAmount', {
                validate: validateRepayAmount,
              })}
              placeholder={amountPlaceholder}
              estimatedValueUsd={repayAmountValueUsd}
              selectProps={{
                selectedProduct: selectedRepayProduct,
                availableProducts: availableRepayProducts,
                assetAmountTitle: t(($) => $.borrowing),
                onProductSelected: (productId) => {
                  // Skip validation and other states as you can only select from available options
                  form.setValue('repayProductId', productId);
                  form.resetField('repayAmount');
                },
              }}
              error={repayAmountErrorTooltipContent}
            />
            <div className="flex flex-col gap-y-2.5">
              <InputSummaryItem
                label={t(($) => $.borrowing)}
                definitionTooltipId="repayAmountBorrowing"
                currentValue={selectedRepayProduct?.amountBorrowed}
                formatSpecifier={CustomNumberFormatSpecifier.NUMBER_AUTO}
                onValueClick={onAmountBorrowingClicked}
              />
              <InputSummaryItem
                label={t(($) => $.maxRepay)}
                definitionTooltipId="repayConvertMaxRepay"
                currentValue={maxRepaySize}
                formatSpecifier={CustomNumberFormatSpecifier.NUMBER_AUTO}
                onValueClick={onMaxRepayClicked}
              />
            </div>
          </RepayConvertInputWrapper>
          {/* Sell Input */}
          <RepayConvertInputWrapper labelContent={t(($) => $.sell)}>
            <CollateralSelectInput
              readOnly
              estimatedValueUsd={sourceAmountValueUsd}
              value={sourceAmount?.toString() ?? ''}
              placeholder={amountPlaceholder}
              selectProps={{
                availableProducts: availableSourceProducts,
                disabled: !availableSourceProducts.length,
                selectedProduct: selectedSourceProduct,
                assetAmountTitle: t(($) => $.balance),
                onProductSelected: (productId) => {
                  // Skip validation and other states as you can only select from available options
                  form.setValue('sourceProductId', productId);
                },
              }}
            />
            <InputSummaryItem
              label={t(($) => $.balance)}
              currentValue={selectedSourceProduct?.decimalAdjustedNadoBalance}
              formatSpecifier={CustomNumberFormatSpecifier.NUMBER_AUTO}
            />
          </RepayConvertInputWrapper>
        </div>
      </div>
      <RepayConvertFormErrorPanel formError={formError} />
      <div className="flex flex-col gap-y-3">
        <RepayConversionRateDisplay
          className="px-1"
          market={market}
          repayConversionPrice={oracleConversionPrice}
        />
        <ActionSummary.Container>
          <DepositSummaryDisclosure
            estimateStateTxs={estimateStateTxs}
            isHighlighted={buttonState === 'idle'}
            productId={selectedRepayProduct?.productId}
            symbol={selectedRepayProduct?.symbol}
          />
          <RepayConvertButton state={buttonState} />
        </ActionSummary.Container>
      </div>
    </Form>
  );
}
