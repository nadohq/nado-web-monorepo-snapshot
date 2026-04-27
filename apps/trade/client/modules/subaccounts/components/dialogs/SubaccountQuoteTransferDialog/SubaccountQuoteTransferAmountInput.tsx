import { Token } from '@nadohq/react-client';
import { WithClassnames, WithRef } from '@nadohq/web-common';
import { CompactInput, CompactInputProps } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { InputProductSymbolWithIcon } from 'client/components/InputProductSymbolWithIcon';
import { useSanitizedNumericOnChange } from 'client/hooks/ui/form/useSanitizedNumericOnChange';
import { EstimatedCurrencyValueItem } from 'client/modules/collateral/components/EstimatedCurrencyValueItem';
import { ReactNode } from 'react';

interface Props extends WithClassnames<
  WithRef<CompactInputProps, HTMLInputElement>
> {
  primaryQuoteToken: Token;
  estimatedValueUsd: BigNumber | undefined;
  error?: ReactNode;
}

export function SubaccountQuoteTransferAmountInput({
  primaryQuoteToken,
  estimatedValueUsd,
  error,
  onChange,
  ...rest
}: Props) {
  const handleChange = useSanitizedNumericOnChange(onChange);

  return (
    <CompactInput
      errorTooltipContent={error}
      startElement={
        <InputProductSymbolWithIcon
          symbol={primaryQuoteToken.symbol}
          productImageSrc={primaryQuoteToken.icon.asset}
        />
      }
      endElement={
        <EstimatedCurrencyValueItem estimatedValueUsd={estimatedValueUsd} />
      }
      onChange={handleChange}
      {...rest}
    />
  );
}
