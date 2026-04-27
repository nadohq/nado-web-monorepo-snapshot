import { getMarketSizeFormatSpecifier } from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { StaticMarketQuoteData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { MidPriceButton } from 'client/modules/trading/components/MidPriceButton';
import { OrderFormSizeInput } from 'client/modules/trading/components/OrderFormInputs/components/OrderFormSizeInput';
import { OrderFormSlider } from 'client/modules/trading/components/OrderFormInputs/components/OrderFormSlider/OrderFormSlider';
import { ScaledOrderFormInputs } from 'client/modules/trading/components/scaledOrder/ScaledOrderFormInputs/ScaledOrderFormInputs';
import { ScaledOrderPriceRangeFormInputs } from 'client/modules/trading/components/scaledOrder/ScaledOrderPriceRangeFormInputs/ScaledOrderPriceRangeFormInputs';
import { TwapOrderFormInputs } from 'client/modules/trading/components/twap/TwapOrderFormInputs/TwapOrderFormInputs';
import { useOrderFormInputs } from 'client/modules/trading/hooks/useOrderFormInputs';
import {
  OrderFormError,
  OrderFormValidators,
  RoundAmountFn,
  RoundPriceFn,
  SetActiveFieldFn,
} from 'client/modules/trading/types/orderFormTypes';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  productId: number | undefined;
  formError: OrderFormError | undefined;
  validators: OrderFormValidators;
  baseSymbol: string | undefined;
  quoteMetadata: StaticMarketQuoteData | undefined;
  priceIncrement: BigNumber | undefined;
  decimalAdjustedSizeIncrement: BigNumber | undefined;
  minAssetOrderSize: BigNumber | undefined;
  inputConversionPrice: BigNumber | undefined;
  maxAssetOrderSize: BigNumber | undefined;
  roundAssetAmount: RoundAmountFn;
  roundPrice: RoundPriceFn;
  validatedSizeInput: BigNumber | undefined;
  validAssetAmount: BigNumber | undefined;
  setActiveField: SetActiveFieldFn;
}

export function OrderFormInputs({
  productId,
  formError,
  baseSymbol,
  quoteMetadata,
  validators,
  priceIncrement,
  minAssetOrderSize,
  inputConversionPrice,
  maxAssetOrderSize,
  roundAssetAmount,
  roundPrice,
  decimalAdjustedSizeIncrement,
  validatedSizeInput,
  validAssetAmount,
  setActiveField,
  className,
}: Props) {
  const { t } = useTranslation();

  const {
    sizeInputRegister,
    limitPriceInputRegister,
    triggerPriceInputRegister,
    showTwapOrderFormInputs,
    showScaledOrderFormInputs,
    showPriceInput,
    showTriggerPriceInput,
    amountFraction,
    errorTooltips,
    onFractionChange,
    onSizeInputFocus,
    setSizeDenom,
    sizeDenom,
    setValue,
  } = useOrderFormInputs({
    formError,
    validators,
    priceIncrement,
    decimalAdjustedSizeIncrement,
    minAssetOrderSize,
    inputConversionPrice,
    isPrimaryQuote: quoteMetadata?.isPrimaryQuote,
  });
  const pricePlaceholder = useNumericInputPlaceholder({
    increment: priceIncrement,
  });

  return (
    <div className={joinClassNames('flex flex-col gap-y-3', className)}>
      {showTriggerPriceInput && (
        <NumberInputWithLabel
          {...triggerPriceInputRegister}
          id={triggerPriceInputRegister.name}
          onFocus={() => setActiveField('triggerPrice')}
          label={t(($) => $.trigger)}
          placeholder={pricePlaceholder}
          step={priceIncrement?.toString()}
          errorTooltipContent={errorTooltips.triggerPrice}
          dataTestId="order-form-trigger-price-input"
        />
      )}
      {showPriceInput && (
        <NumberInputWithLabel
          dataTestId="order-form-limit-price-input"
          {...limitPriceInputRegister}
          id={limitPriceInputRegister.name}
          onFocus={() => setActiveField('limitPrice')}
          label={t(($) => $.price)}
          placeholder={pricePlaceholder}
          step={priceIncrement?.toString()}
          endElement={
            <MidPriceButton
              productId={productId}
              priceIncrement={priceIncrement}
              setPriceInput={(price) => setValue('limitPrice', price)}
            />
          }
          errorTooltipContent={errorTooltips.price}
        />
      )}
      {showScaledOrderFormInputs && (
        <ScaledOrderPriceRangeFormInputs
          validators={validators}
          priceIncrement={priceIncrement}
          formError={formError}
          setActiveField={setActiveField}
        />
      )}
      <OrderFormSizeInput
        sizeInputRegister={sizeInputRegister}
        baseSymbol={baseSymbol}
        quoteSymbol={quoteMetadata?.symbol}
        sizeErrorTooltip={errorTooltips.size}
        decimalAdjustedSizeIncrement={decimalAdjustedSizeIncrement}
        priceIncrement={priceIncrement}
        sizeDenom={sizeDenom}
        setSizeDenom={setSizeDenom}
        onSizeInputFocus={onSizeInputFocus}
      />
      <OrderFormSlider
        amountFraction={amountFraction}
        onFractionChange={onFractionChange}
        validatedSizeInput={validatedSizeInput}
        inputConversionPrice={inputConversionPrice}
        roundAssetAmount={roundAssetAmount}
        decimalAdjustedSizeIncrement={decimalAdjustedSizeIncrement}
        maxAssetOrderSize={maxAssetOrderSize}
        getMarketSizeFormatSpecifier={getMarketSizeFormatSpecifier}
        sizeDenom={sizeDenom}
        baseSymbol={baseSymbol}
        quoteMetadata={quoteMetadata}
      />
      {showTwapOrderFormInputs && (
        <TwapOrderFormInputs formError={formError} validators={validators} />
      )}
      {showScaledOrderFormInputs && (
        <ScaledOrderFormInputs
          formError={formError}
          validators={validators}
          productId={productId}
          roundPrice={roundPrice}
          roundAssetAmount={roundAssetAmount}
          validAssetAmount={validAssetAmount}
        />
      )}
    </div>
  );
}
