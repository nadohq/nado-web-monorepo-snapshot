import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { PercentageRangeSlider } from 'client/components/RangeSlider/PercentageRangeSlider';
import { OrderFormSliderLabels } from 'client/modules/trading/components/OrderFormInputs/components/OrderFormSlider/OrderFormSliderLabels';
import { UseOrderFormSliderLabelsParams } from 'client/modules/trading/components/OrderFormInputs/components/OrderFormSlider/useOrderFormSliderLabels';

interface Props extends WithClassnames<UseOrderFormSliderLabelsParams> {
  onFractionChange: (value: number) => void;
}

export function OrderFormSlider({
  amountFraction,
  onFractionChange,
  validatedSizeInput,
  inputConversionPrice,
  roundAssetAmount,
  decimalAdjustedSizeIncrement,
  maxAssetOrderSize,
  getMarketSizeFormatSpecifier,
  sizeDenom,
  baseSymbol,
  quoteMetadata,
  className,
}: Props) {
  return (
    <div className={joinClassNames('flex flex-col gap-y-1.5', className)}>
      <PercentageRangeSlider
        value={amountFraction}
        onValueChange={onFractionChange}
        hideLabels
      />
      <OrderFormSliderLabels
        amountFraction={amountFraction}
        validatedSizeInput={validatedSizeInput}
        inputConversionPrice={inputConversionPrice}
        roundAssetAmount={roundAssetAmount}
        sizeDenom={sizeDenom}
        baseSymbol={baseSymbol}
        quoteMetadata={quoteMetadata}
        decimalAdjustedSizeIncrement={decimalAdjustedSizeIncrement}
        maxAssetOrderSize={maxAssetOrderSize}
        getMarketSizeFormatSpecifier={getMarketSizeFormatSpecifier}
      />
    </div>
  );
}
