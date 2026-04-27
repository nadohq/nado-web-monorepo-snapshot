import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import {
  useOrderFormSliderLabels,
  UseOrderFormSliderLabelsParams,
} from 'client/modules/trading/components/OrderFormInputs/components/OrderFormSlider/useOrderFormSliderLabels';
import { useTranslation } from 'react-i18next';

export function OrderFormSliderLabels({
  amountFraction,
  validatedSizeInput,
  inputConversionPrice,
  roundAssetAmount,
  sizeDenom,
  baseSymbol,
  quoteMetadata,
  decimalAdjustedSizeIncrement,
  maxAssetOrderSize,
  getMarketSizeFormatSpecifier,
}: UseOrderFormSliderLabelsParams) {
  const { t } = useTranslation();

  const { size, sizeFormatSpecifier, maxSize, sizeSymbol } =
    useOrderFormSliderLabels({
      amountFraction,
      validatedSizeInput,
      inputConversionPrice,
      roundAssetAmount,
      sizeDenom,
      baseSymbol,
      quoteMetadata,
      decimalAdjustedSizeIncrement,
      maxAssetOrderSize,
      getMarketSizeFormatSpecifier,
    });

  const formattedAmountFraction = `${formatNumber(amountFraction, {
    formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_INT,
  })}=`;

  return (
    <div className="flex items-center justify-between text-xs">
      <ValueWithLabel.Horizontal
        className="gap-x-0.5"
        label={formattedAmountFraction}
        sizeVariant="xs"
        value={size}
        valueEndElement={sizeSymbol}
        numberFormatSpecifier={sizeFormatSpecifier}
        dataTestId="order-form-slider-current-size"
      />
      <ValueWithLabel.Horizontal
        className="gap-x-0.5"
        label={t(($) => $.maxAbbrev)}
        sizeVariant="xs"
        value={maxSize}
        valueEndElement={sizeSymbol}
        numberFormatSpecifier={sizeFormatSpecifier}
        dataTestId="order-form-slider-max-size"
      />
    </div>
  );
}
