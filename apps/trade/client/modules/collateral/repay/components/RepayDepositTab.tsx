import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { Button } from '@nadohq/web-ui';
import { ActionSummary } from 'client/components/ActionSummary';
import { Form } from 'client/components/Form';
import { InputSummaryItem } from 'client/components/InputSummaryItem';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { CollateralSelectInput } from 'client/modules/collateral/components/CollateralSelectInput';
import { DepositSummaryDisclosure } from 'client/modules/collateral/components/DepositSummaryDisclosure';
import { useDepositAmountErrorTooltipContent } from 'client/modules/collateral/deposit/hooks/useDepositAmountErrorTooltipContent';
import { RepayDepositButton } from 'client/modules/collateral/repay/components/RepayDepositButton';
import { useRepayDepositForm } from 'client/modules/collateral/repay/hooks/useRepayDepositForm';
import { useTranslation } from 'react-i18next';

export const RepayDepositTab = ({
  initialProductId,
}: {
  initialProductId: number | undefined;
}) => {
  const { t } = useTranslation();
  const {
    form,
    formError,
    selectedProduct,
    availableProducts,
    balances,
    estimateStateTxs,
    buttonState,
    amountInputValueUsd,
    minDepositAmount,
    onMaxRepayClicked,
    onAmountBorrowingClicked,
    onMaxDepositClicked,
    validateAmount,
    onSubmit,
  } = useRepayDepositForm({ initialProductId });

  const amountErrorTooltipContent = useDepositAmountErrorTooltipContent({
    formError,
    minDepositAmount,
  });

  const amountPlaceholder = useNumericInputPlaceholder();

  return (
    <Form onSubmit={onSubmit} className="flex w-full flex-col gap-y-4">
      {/*Amount input*/}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-text-secondary text-sm">{t(($) => $.repay)}</h2>
          <Button
            as="div"
            className="text-accent text-xs"
            onClick={onMaxRepayClicked}
          >
            {t(($) => $.buttons.maxRepay)}
          </Button>
        </div>
        <div className="flex flex-col gap-y-1.5">
          <CollateralSelectInput
            {...form.register('amount', {
              validate: validateAmount,
            })}
            placeholder={amountPlaceholder}
            estimatedValueUsd={amountInputValueUsd}
            selectProps={{
              selectedProduct,
              availableProducts,
              assetAmountTitle: t(($) => $.borrowing),
              onProductSelected: (productId) => {
                // Skip validation and other states as you can only select from available options
                form.setValue('productId', productId);
              },
            }}
            error={amountErrorTooltipContent}
            onFocus={() => {
              form.setValue('amountSource', 'absolute');
            }}
          />
          <div className="flex flex-col gap-y-2.5">
            <InputSummaryItem
              label={t(($) => $.borrowing)}
              definitionTooltipId="repayAmountBorrowing"
              currentValue={balances.current?.borrowed}
              formatSpecifier={CustomNumberFormatSpecifier.NUMBER_AUTO}
              onValueClick={onAmountBorrowingClicked}
            />
            <InputSummaryItem
              label={t(($) => $.maxDeposit)}
              definitionTooltipId="repayDepositMaxDeposit"
              currentValue={balances.current?.wallet}
              formatSpecifier={CustomNumberFormatSpecifier.NUMBER_AUTO}
              onValueClick={onMaxDepositClicked}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-2.5 pt-3">
        <ActionSummary.Container>
          <DepositSummaryDisclosure
            estimateStateTxs={estimateStateTxs}
            productId={selectedProduct?.productId}
            isHighlighted={buttonState === 'idle'}
            symbol={selectedProduct?.symbol}
          />
          <RepayDepositButton state={buttonState} />
        </ActionSummary.Container>
      </div>
    </Form>
  );
};
