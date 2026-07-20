import {
  getMarketQuoteSizeFormatSpecifier,
  getMarketSizeFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { StaticMarketQuoteData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import {
  OrderFormSizeDenom,
  RoundAmountFn,
} from 'client/modules/trading/types/orderFormTypes';
import {
  convertAssetAmountToOrderSize,
  toNewDenomOrderSize,
} from 'client/modules/trading/utils/orderSizeConversions';
import { useMemo } from 'react';

export interface UseOrderFormSliderLabelsParams {
  sizeDenom: OrderFormSizeDenom;
  amountFraction: number;
  validatedSizeInput: BigNumber | undefined;
  inputConversionPrice: BigNumber | undefined;
  roundAssetAmount: RoundAmountFn;
  baseSymbol: string | undefined;
  quoteMetadata: StaticMarketQuoteData | undefined;
  decimalAdjustedSizeIncrement: BigNumber | undefined;
  maxAssetOrderSize: BigNumber | undefined;
  exchangeRate: BigNumber;
}

export function useOrderFormSliderLabels({
  amountFraction,
  validatedSizeInput,
  inputConversionPrice,
  roundAssetAmount,
  sizeDenom,
  baseSymbol,
  quoteMetadata,
  decimalAdjustedSizeIncrement,
  maxAssetOrderSize,
  exchangeRate,
}: UseOrderFormSliderLabelsParams) {
  const oppositeSizeDenom: OrderFormSizeDenom = useMemo(() => {
    return sizeDenom === 'asset' ? 'quote' : 'asset';
  }, [sizeDenom]);

  const size = useMemo(() => {
    if (!validatedSizeInput || !inputConversionPrice) return;

    return toNewDenomOrderSize({
      size: validatedSizeInput,
      sizeDenom: oppositeSizeDenom,
      conversionPrice: inputConversionPrice,
      roundAssetAmount,
    });
  }, [
    inputConversionPrice,
    oppositeSizeDenom,
    roundAssetAmount,
    validatedSizeInput,
  ]);

  const sizeSymbol = useMemo(() => {
    if (oppositeSizeDenom === 'asset') {
      return baseSymbol;
    }

    // Primary quote (e.g. USD) shows as a $ amount → no symbol needed
    // Non-primary quotes keep their symbol
    return quoteMetadata?.isPrimaryQuote ? '' : quoteMetadata?.symbol;
  }, [
    oppositeSizeDenom,
    baseSymbol,
    quoteMetadata?.isPrimaryQuote,
    quoteMetadata?.symbol,
  ]);

  const sizeFormatSpecifier = useMemo(() => {
    return oppositeSizeDenom === 'asset'
      ? getMarketSizeFormatSpecifier({
          sizeIncrement: decimalAdjustedSizeIncrement,
          shouldRemoveDecimals: false,
          exchangeRate,
        })
      : getMarketQuoteSizeFormatSpecifier({
          isPrimaryQuote: quoteMetadata?.isPrimaryQuote,
          primaryQuoteAsCurrency: true,
        });
  }, [
    oppositeSizeDenom,
    decimalAdjustedSizeIncrement,
    exchangeRate,
    quoteMetadata?.isPrimaryQuote,
  ]);

  const maxSize = useMemo(() => {
    if (!maxAssetOrderSize || !inputConversionPrice) return;

    return convertAssetAmountToOrderSize({
      assetAmount: maxAssetOrderSize,
      sizeDenom: oppositeSizeDenom,
      conversionPrice: inputConversionPrice,
      roundAssetAmount,
    });
  }, [
    inputConversionPrice,
    maxAssetOrderSize,
    oppositeSizeDenom,
    roundAssetAmount,
  ]);

  return {
    size,
    sizeFormatSpecifier,
    sizeSymbol,
    maxSize,
    amountFraction,
  };
}
