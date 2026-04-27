import {
  NLP_TOKEN_INFO,
  PresetNumberFormatSpecifier,
  SEQUENCER_FEE_AMOUNT_USDT,
  useNlpState,
} from '@nadohq/react-client';
import { CompactInput } from '@nadohq/web-ui';
import { EnableBorrowsSwitch } from 'client/components/EnableBorrowsSwitch';
import { ErrorPanel } from 'client/components/ErrorPanel';
import { Form } from 'client/components/Form';
import { FractionAmountButtons } from 'client/components/FractionAmountButtons';
import { InputProductSymbolWithIcon } from 'client/components/InputProductSymbolWithIcon';
import { InputSummaryItem } from 'client/components/InputSummaryItem';
import { UserDisclosureDismissibleCard } from 'client/components/UserDisclosureDismissibleCard';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useSanitizedNumericOnChange } from 'client/hooks/ui/form/useSanitizedNumericOnChange';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { DepositNlpLiquiditySubmitButton } from 'client/modules/nlp/deposit/DepositNlpLiquiditySubmitButton';
import { useDepositNlpLiquidityAmountErrorTooltipContent } from 'client/modules/nlp/deposit/hooks/useDepositNlpLiquidityAmountErrorTooltipContent';
import { useDepositNlpLiquidityDialog } from 'client/modules/nlp/deposit/hooks/useDepositNlpLiquidityDialog';
import { formatDuration } from 'date-fns';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function DepositNlpLiquidityDialog() {
  const { t } = useTranslation();

  const { hide } = useDialog();

  const {
    form,
    formError,
    estimatedNlpAmount,
    buttonState,
    validateAmount,
    onFractionSelected,
    onEnableBorrowsChange,
    onSubmit,
    primaryQuoteToken,
    enableBorrows,
    decimalAdjustedMaxQuoteAmountWithFee,
    maxDepositAmountUsd,
    nlpLockupPeriodInDays,
  } = useDepositNlpLiquidityDialog();
  const amountErrorTooltipContent =
    useDepositNlpLiquidityAmountErrorTooltipContent({
      formError,
    });

  const amountRegister = form.register('amount', {
    validate: validateAmount,
  });
  const handleChange = useSanitizedNumericOnChange(amountRegister.onChange);

  // Hack during alpha to communicate capacity
  const nlpState = useNlpState();
  // Second check is a failsafe for when we do bump the limit without an immediate FE update
  const isAtCapacity =
    nlpState?.tvlUsd?.gt(9e6) && decimalAdjustedMaxQuoteAmountWithFee?.isZero();

  const amountPlaceholder = useNumericInputPlaceholder({
    decimals: primaryQuoteToken.tokenDecimals,
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.depositLiquidity)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onSubmit}>
          <EnableBorrowsSwitch
            enableBorrows={enableBorrows}
            onEnableBorrowsChange={onEnableBorrowsChange}
          />
          <div className="flex flex-col gap-y-1.5">
            <CompactInput
              {...amountRegister}
              placeholder={amountPlaceholder}
              onFocus={() => {
                form.setValue('amountSource', 'absolute');
              }}
              onChange={handleChange}
              errorTooltipContent={amountErrorTooltipContent}
              startElement={
                <InputProductSymbolWithIcon
                  productImageSrc={primaryQuoteToken.icon.asset}
                  symbol={primaryQuoteToken.symbol}
                />
              }
              dataTestId="nlp-deposit-dialog-amount-input"
            />
            <InputSummaryItem
              label={t(($) => $.available)}
              formatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
              currentValue={decimalAdjustedMaxQuoteAmountWithFee}
              onValueClick={() => onFractionSelected(1)}
              dataTestId="nlp-deposit-dialog-available-input"
            />
            <InputSummaryItem
              label={t(($) => $.maxDeposit)}
              definitionTooltipId="nlpMaxDeposit"
              formatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
              currentValue={maxDepositAmountUsd}
              dataTestId="nlp-deposit-dialog-max-deposit-input"
            />
          </div>
          <FractionAmountButtons onFractionSelected={onFractionSelected} />
          <div className="flex flex-col gap-y-1.5">
            <InputSummaryItem
              label={t(($) => $.gasFee)}
              formatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
              currentValue={SEQUENCER_FEE_AMOUNT_USDT}
              definitionTooltipId="gasFee"
              dataTestId="nlp-deposit-dialog-gas-fee-input"
            />
            <InputSummaryItem
              label={t(($) => $.receive)}
              currentValue={estimatedNlpAmount}
              formatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
              valueClassName="items-center"
              dataTestId="nlp-deposit-dialog-receive-input"
              valueEndElement={
                <Image
                  src={NLP_TOKEN_INFO.icon.asset}
                  alt=""
                  className="h-5 w-auto"
                />
              }
            />
            <ValueWithLabel.Horizontal
              fitWidth
              label={t(($) => $.lockupPeriod)}
              labelClassName="label-separator"
              tooltip={{ id: 'nlpLockupPeriod' }}
              sizeVariant="xs"
              valueContent={formatDuration({
                days: nlpLockupPeriodInDays,
              })}
              dataTestId="nlp-deposit-dialog-lock-up-period-input"
            />
          </div>
          <UserDisclosureDismissibleCard
            disclosureKey="nlp_deposit"
            description={t(($) => $.nlpInBalancesContributesToMargin)}
          />
          {isAtCapacity && (
            <ErrorPanel>{t(($) => $.errors.nlpPoolAtCapacityError)}</ErrorPanel>
          )}
          <DepositNlpLiquiditySubmitButton state={buttonState} />
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
