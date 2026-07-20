import { BigNumber } from 'bignumber.js';

type ConversionResult<T extends BigNumber | undefined> = T extends undefined
  ? undefined
  : BigNumber;

/**
 * Converts a wQQQx-denominated price to the underlying QQQx display price.
 * For non-xStocks markets the exchange rate is 1, making this a no-op.
 * Returns undefined if wPrice is undefined.
 *
 * Context: backend stores amounts & prices in wQQQx units, but we want to show QQQx units (which correspond to actual stock price / amt)
 */
export function toXStocksDisplayPrice<T extends BigNumber | undefined>(
  wPrice: T,
  exchangeRate: BigNumber,
): ConversionResult<T> {
  if (!wPrice) return undefined as ConversionResult<T>;
  return wPrice.div(exchangeRate) as ConversionResult<T>;
}

/**
 * Converts a wQQQx-denominated amount to the underlying QQQx display amount.
 * For non-xStocks markets the exchange rate is 1, making this a no-op.
 * Returns undefined if wAmount is undefined.
 *
 * Context: backend stores amounts & prices in wQQQx units, but we want to show QQQx units (which correspond to actual stock price / amt)
 */
export function toXStocksDisplayAmount<T extends BigNumber | undefined>(
  wAmount: T,
  exchangeRate: BigNumber,
): ConversionResult<T> {
  if (!wAmount) return undefined as ConversionResult<T>;
  return wAmount.times(exchangeRate) as ConversionResult<T>;
}

/**
 * Converts a QQQx display price to the wQQQx raw price for backend execution.
 * For non-xStocks markets the exchange rate is 1, making this a no-op.
 * Returns undefined if displayPrice is undefined.
 */
export function toXStocksRawPrice<T extends BigNumber | undefined>(
  displayPrice: T,
  exchangeRate: BigNumber,
): ConversionResult<T> {
  if (!displayPrice) return undefined as ConversionResult<T>;
  return displayPrice.times(exchangeRate) as ConversionResult<T>;
}

/**
 * Converts a QQQx display amount to the wQQQx raw amount for backend execution.
 * For non-xStocks markets the exchange rate is 1, making this a no-op.
 * Returns undefined if displayAmount is undefined.
 */
export function toXStocksRawAmount<T extends BigNumber | undefined>(
  displayAmount: T,
  exchangeRate: BigNumber,
): ConversionResult<T> {
  if (!displayAmount) return undefined as ConversionResult<T>;
  return displayAmount.div(exchangeRate) as ConversionResult<T>;
}
