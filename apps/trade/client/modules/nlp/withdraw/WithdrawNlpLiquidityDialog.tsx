import {
  NLP_TOKEN_INFO,
  PresetNumberFormatSpecifier,
  SEQUENCER_FEE_AMOUNT_USDT,
} from '@nadohq/react-client';
import { CompactInput } from '@nadohq/web-ui';
import { Form } from 'client/components/Form';
import { FractionAmountButtons } from 'client/components/FractionAmountButtons';
import { InputProductSymbolWithIcon } from 'client/components/InputProductSymbolWithIcon';
import { InputSummaryItem } from 'client/components/InputSummaryItem';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useSanitizedNumericOnChange } from 'client/hooks/ui/form/useSanitizedNumericOnChange';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useWithdrawNlpLiquidityAmountErrorTooltipContent } from 'client/modules/nlp/withdraw/hooks/useWithdrawNlpLiquidityAmountErrorTooltipContent';
import { useWithdrawNlpLiquidityDialog } from 'client/modules/nlp/withdraw/hooks/useWithdrawNlpLiquidityDialog';
import { WithdrawNlpLiquiditySubmitButton } from 'client/modules/nlp/withdraw/WithdrawNlpLiquiditySubmitButton';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function WithdrawNlpLiquidityDialog() {
  const { t } = useTranslation();
  const { hide } = useDialog();

  const {
    form,
    formError,
    estimatedPrimaryQuoteAmount,
    buttonState,
    validateAmount,
    onFractionSelected,
    onSubmit,
    primaryQuoteToken,
    maxBurnNlpAmount,
    nlpLockedBalanceAmount,
  } = useWithdrawNlpLiquidityDialog();
  const amountErrorTooltipContent =
    useWithdrawNlpLiquidityAmountErrorTooltipContent({
      formError,
    });

  const amountRegister = form.register('amount', {
    validate: validateAmount,
  });
  const handleChange = useSanitizedNumericOnChange(amountRegister.onChange);

  const amountPlaceholder = useNumericInputPlaceholder();

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.withdrawLiquidity)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onSubmit}>
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
                  productImageSrc={NLP_TOKEN_INFO.icon.asset}
                  symbol={NLP_TOKEN_INFO.symbol}
                />
              }
            />
            <div className="flex flex-col gap-y-1.5">
              <InputSummaryItem
                label={t(($) => $.available)}
                formatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
                currentValue={maxBurnNlpAmount}
                onValueClick={() => onFractionSelected(1)}
              />
              <ValueWithLabel.Horizontal
                fitWidth
                label={t(($) => $.locked)}
                tooltip={{ id: 'nlpLockedBalance' }}
                sizeVariant="xs"
                value={nlpLockedBalanceAmount}
                numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
              />
            </div>
          </div>
          <FractionAmountButtons onFractionSelected={onFractionSelected} />
          <div className="flex flex-col gap-y-1.5">
            <InputSummaryItem
              label={t(($) => $.gasFee)}
              formatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
              currentValue={SEQUENCER_FEE_AMOUNT_USDT}
              definitionTooltipId="gasFee"
            />
            <InputSummaryItem
              label={t(($) => $.receive)}
              currentValue={estimatedPrimaryQuoteAmount}
              formatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
              valueClassName="items-center"
              valueEndElement={
                <Image
                  src={primaryQuoteToken.icon.asset}
                  alt=""
                  className="h-5 w-auto"
                />
              }
            />
          </div>
          <WithdrawNlpLiquiditySubmitButton state={buttonState} />
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
