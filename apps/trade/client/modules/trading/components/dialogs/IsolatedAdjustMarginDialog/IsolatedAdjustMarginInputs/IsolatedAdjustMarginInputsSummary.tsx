import {
  CustomNumberFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { InputSummaryItem } from 'client/components/InputSummaryItem';
import { ISO_MARGIN_TRANSFER_FEE_AMOUNT_USDT } from 'client/consts/isoMarginTransferFee';
import { useTranslation } from 'react-i18next';

interface Props {
  maxWithdrawable: BigNumber | undefined;
  isAddMargin: boolean;
  enableBorrows: boolean;
  primaryQuoteSymbol: string;

  onMaxAmountClicked(): void;
}

export function IsolatedAdjustMarginInputsSummary({
  isAddMargin,
  maxWithdrawable,
  onMaxAmountClicked,
  enableBorrows,
  primaryQuoteSymbol,
}: Props) {
  const { t } = useTranslation();

  const isAddWithBorrows = enableBorrows && isAddMargin;

  const maxWithdrawableLabel = isAddWithBorrows
    ? t(($) => $.maxWithBorrow)
    : t(($) => $.maxAmount);

  const maxWithdrawableDefinitionTooltipId = isAddWithBorrows
    ? 'maxWithBorrow'
    : 'maxAmount';

  return (
    <div className="flex flex-col gap-y-3">
      <InputSummaryItem
        label={maxWithdrawableLabel}
        currentValue={maxWithdrawable}
        formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
        definitionTooltipId={maxWithdrawableDefinitionTooltipId}
        onValueClick={onMaxAmountClicked}
      />
      <InputSummaryItem
        label={t(($) => $.gasFee)}
        formatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
        currentValue={ISO_MARGIN_TRANSFER_FEE_AMOUNT_USDT}
        valueEndElement={primaryQuoteSymbol}
        definitionTooltipId="gasFee"
      />
    </div>
  );
}
