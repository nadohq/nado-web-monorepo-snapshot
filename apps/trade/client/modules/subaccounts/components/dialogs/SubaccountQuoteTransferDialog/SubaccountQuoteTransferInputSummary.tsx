import {
  CustomNumberFormatSpecifier,
  PresetNumberFormatSpecifier,
  SEQUENCER_FEE_AMOUNT_USDT,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { InputSummaryItem } from 'client/components/InputSummaryItem';
import { useTranslation } from 'react-i18next';

interface Props {
  decimalAdjustedMaxWithdrawableWithFee: BigNumber | undefined;
  enableBorrows: boolean;
  onFractionSelected: (fraction: number) => void;
  symbol: string;
}

export function SubaccountQuoteTransferInputSummary({
  decimalAdjustedMaxWithdrawableWithFee,
  enableBorrows,
  onFractionSelected,
  symbol,
}: Props) {
  const { t } = useTranslation();

  const maxWithdrawableLabel = enableBorrows
    ? t(($) => $.maxWithBorrow)
    : t(($) => $.maxAmount);

  const maxWithdrawableDefinitionTooltipId = enableBorrows
    ? 'maxWithBorrow'
    : 'maxAmount';

  return (
    <div className="flex flex-col gap-y-3">
      <InputSummaryItem
        label={maxWithdrawableLabel}
        currentValue={decimalAdjustedMaxWithdrawableWithFee}
        formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
        definitionTooltipId={maxWithdrawableDefinitionTooltipId}
        onValueClick={() => onFractionSelected(1)}
      />
      <InputSummaryItem
        label={t(($) => $.gasFee)}
        formatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
        currentValue={SEQUENCER_FEE_AMOUNT_USDT}
        valueEndElement={symbol}
        definitionTooltipId="gasFee"
      />
    </div>
  );
}
