import {
  CustomNumberFormatSpecifier,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { InputSummaryItem } from 'client/components/InputSummaryItem';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface Props {
  enableBorrows: boolean;
  selectedProductMaxWithdrawable?: BigNumber;
  onMaxAmountSelected: () => void;
}

export function WithdrawInputSummary({
  selectedProductMaxWithdrawable,
  enableBorrows,
  onMaxAmountSelected,
}: Props) {
  const { t } = useTranslation();
  const {
    primaryChainEnvMetadata: { chainName, chainIcon },
  } = useNadoMetadataContext();

  return (
    <div className="flex flex-col gap-y-3">
      {/*Need to use the base component of InputSummaryItem here as*/}
      {/*InputSummaryItem does not support custom `valueContent`*/}
      <ValueWithLabel.Horizontal
        fitWidth
        sizeVariant="xs"
        label={t(($) => $.chain)}
        valueContent={
          <div className="flex items-center gap-x-0.5">
            <Image src={chainIcon} alt={chainName} className="size-3" />
            {chainName}
          </div>
        }
      />
      <InputSummaryItem
        formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
        label={
          enableBorrows ? t(($) => $.maxWithBorrow) : t(($) => $.maxAmount)
        }
        currentValue={selectedProductMaxWithdrawable}
        definitionTooltipId={enableBorrows ? 'maxWithBorrow' : 'maxAmount'}
        onValueClick={onMaxAmountSelected}
      />
    </div>
  );
}
