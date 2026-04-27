import {
  formatNumber,
  getMarketQuoteSizeFormatSpecifier,
  getMarketSizeFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import {
  OrderFormError,
  OrderFormSizeDenom,
} from 'client/modules/trading/types/orderFormTypes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  /** The error type returned by the order form validators. */
  formError: OrderFormError | undefined;
  /** The decimal adjusted size increment. */
  decimalAdjustedSizeIncrement: BigNumber | undefined;
  /** The minimum asset order size. */
  minAssetOrderSize: BigNumber | undefined;
  /** The size denomination of the input. */
  sizeDenom: OrderFormSizeDenom | undefined;
  /** The conversion price of the input. */
  inputConversionPrice: BigNumber | undefined;
  /** Whether the market's quote currency is the primary quote. */
  isPrimaryQuote: boolean | undefined;
}

export function useOrderFormSizeErrorTooltipContent({
  formError,
  decimalAdjustedSizeIncrement: sizeIncrement,
  minAssetOrderSize,
  sizeDenom,
  inputConversionPrice,
  isPrimaryQuote,
}: Params) {
  const { t } = useTranslation();

  const isQuote = sizeDenom === 'quote';

  const isConvertedToQuote = isQuote && !!inputConversionPrice;

  const minSizeInCurrentDenom = isConvertedToQuote
    ? minAssetOrderSize?.multipliedBy(inputConversionPrice)
    : minAssetOrderSize;

  const formattedMin = formatNumber(minSizeInCurrentDenom, {
    formatSpecifier: isConvertedToQuote
      ? getMarketQuoteSizeFormatSpecifier({
          isPrimaryQuote,
        })
      : getMarketSizeFormatSpecifier({
          sizeIncrement,
          shouldRemoveDecimals: false,
        }),
  });

  return useMemo(() => {
    switch (formError) {
      case 'invalid_size_input':
        return t(($) => $.errors.invalidAmountInput);
      case 'below_min':
        return t(($) => $.errors.belowMinAmount, {
          formattedMinValue: formattedMin,
        });
      case 'twap_amount_per_suborder_size_below_min':
      case 'scaled_order_asset_amount_per_order_size_below_min':
        return t(($) => $.errors.suborderSizeBelowMin, {
          minOrderSize: formattedMin,
        });
      case 'invalid_size_increment':
        return t(($) => $.errors.invalidSizeIncrement, { sizeIncrement });
      case 'max_exceeded':
        return t(($) => $.errors.positionLimitExceeded);
      default:
        return null;
    }
  }, [formError, formattedMin, sizeIncrement, t]);
}
