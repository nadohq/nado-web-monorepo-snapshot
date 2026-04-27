import { joinClassNames, WithClassnames, WithRef } from '@nadohq/web-common';
import { CompactInput, CompactInputProps } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { useSanitizedNumericOnChange } from 'client/hooks/ui/form/useSanitizedNumericOnChange';
import {
  AssetSelectProps,
  CollateralAssetSelect,
} from 'client/modules/collateral/components/CollateralAssetSelect';
import { EstimatedCurrencyValueItem } from 'client/modules/collateral/components/EstimatedCurrencyValueItem';
import { ReactNode } from 'react';

interface Props extends WithClassnames<
  WithRef<CompactInputProps, HTMLInputElement>
> {
  selectProps: AssetSelectProps;
  estimatedValueUsd: BigNumber | undefined;
  error?: ReactNode;
}

export function CollateralSelectInput({
  className,
  selectProps,
  estimatedValueUsd,
  error,
  onChange,
  ...rest
}: Props) {
  const {
    availableProducts,
    selectedProduct,
    assetAmountTitle,
    disabled: disableSelect,
    optionsClassName,
    onProductSelected,
  } = selectProps;

  const handleChange = useSanitizedNumericOnChange(onChange);

  return (
    <CompactInput
      errorTooltipContent={error}
      inputContainerClassName={joinClassNames('pl-0', className)}
      startElement={
        <CollateralAssetSelect
          className="h-full w-max min-w-24"
          disabled={disableSelect}
          availableProducts={availableProducts}
          selectedProduct={selectedProduct}
          assetAmountTitle={assetAmountTitle}
          optionsClassName={optionsClassName}
          onProductSelected={onProductSelected}
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
