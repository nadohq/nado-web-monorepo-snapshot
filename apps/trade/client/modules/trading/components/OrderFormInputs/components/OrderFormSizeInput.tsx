import { Icons, TextButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { OrderFormSizeDenom } from 'client/modules/trading/types/orderFormTypes';
import { useCallback } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  sizeInputRegister: UseFormRegisterReturn;
  baseSymbol: string | undefined;
  quoteSymbol: string | undefined;
  sizeErrorTooltip: string | null;
  decimalAdjustedSizeIncrement: BigNumber | undefined;
  priceIncrement: BigNumber | undefined;
  sizeDenom: OrderFormSizeDenom;
  setSizeDenom: (denom: OrderFormSizeDenom) => void;
  onSizeInputFocus: () => void;
}

export function OrderFormSizeInput({
  sizeInputRegister,
  baseSymbol,
  quoteSymbol,
  sizeErrorTooltip,
  decimalAdjustedSizeIncrement,
  priceIncrement,
  sizeDenom,
  onSizeInputFocus,
  setSizeDenom,
}: Props) {
  const { t } = useTranslation();

  const toggleSizeDenom = useCallback(() => {
    setSizeDenom(sizeDenom === 'asset' ? 'quote' : 'asset');
  }, [sizeDenom, setSizeDenom]);

  const currentSymbol = sizeDenom === 'asset' ? baseSymbol : quoteSymbol;
  const currentStep =
    sizeDenom === 'asset'
      ? decimalAdjustedSizeIncrement?.toString()
      : // Use priceIncrement instead of a fixed '0.01'.
        // A fixed step is impractical for large prices —
        // e.g., for BTC, if priceIncrement is 1, adjusting in 0.01 steps is tedious.
        priceIncrement?.toString();

  const sizePlaceholder = useNumericInputPlaceholder({
    increment: currentStep,
  });

  return (
    <NumberInputWithLabel
      {...sizeInputRegister}
      id={sizeInputRegister.name}
      label={t(($) => $.size)}
      placeholder={sizePlaceholder}
      step={currentStep}
      dataTestId="order-form-size-input"
      errorTooltipContent={sizeErrorTooltip}
      onFocus={onSizeInputFocus}
      endElement={
        <TextButton
          endIcon={<Icons.ArrowsLeftRight size={12} />}
          colorVariant="tertiary"
          onClick={toggleSizeDenom}
          dataTestId="order-form-size-denom-button"
        >
          {currentSymbol}
        </TextButton>
      }
    />
  );
}
