import {
  BigNumbers,
  IndexerOraclePrice,
  PriceTriggerRequirementType,
  QUOTE_PRODUCT_ID,
} from '@nadohq/client';
import {
  calcMarketConversionPriceFromOraclePrice,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';

interface GetOraclePriceTriggerTypeParams {
  /** User-entered trigger price in display (QQQx) space. */
  triggerPrice: BigNumber;
  productId: number;
  quoteProductId: number;
  latestOraclePrices: Record<number, IndexerOraclePrice> | undefined;
  /**
   * xStocks exchange rate (defaults to 1 for non-xStocks markets). Oracle
   * prices come from the backend in raw (wQQQx) space — we convert to
   * display space here so the comparison is in the same units as the
   * user-entered trigger price.
   */
  exchangeRate?: BigNumber;
}

/**
 * Derives the `oracle_price_above` / `oracle_price_below` trigger criterion
 * by comparing `triggerPrice` against the market's current oracle conversion
 * price. The backend trigger service evaluates against oracle prices, so the
 * client-side direction check has to compare against the same reference —
 * mid-price would diverge in volatile markets and pick the wrong side.
 *
 * Returns `undefined` if oracle data is missing or zero so callers can decide
 * how to surface the error (warn-and-skip in form submit handlers; throw in
 * the chart broker placement path, which propagates to a TV notification).
 *
 * For markets quoted in USDT0 (most perps) the conversion price equals the
 * base oracle price; for non-primary quotes we divide base/quote oracles.
 */
export function getOraclePriceTriggerType({
  triggerPrice,
  productId,
  quoteProductId,
  latestOraclePrices,
  exchangeRate = BigNumbers.ONE,
}: GetOraclePriceTriggerTypeParams): PriceTriggerRequirementType | undefined {
  const baseOraclePrice = latestOraclePrices?.[productId]?.oraclePrice;
  // Primary quote (USDT0) is anchored to 1 — no oracle lookup needed.
  const quoteOraclePrice =
    quoteProductId === QUOTE_PRODUCT_ID
      ? BigNumbers.ONE
      : latestOraclePrices?.[quoteProductId]?.oraclePrice;

  if (
    !baseOraclePrice ||
    !quoteOraclePrice ||
    baseOraclePrice.isZero() ||
    quoteOraclePrice.isZero()
  ) {
    return undefined;
  }

  const rawOracleConversionPrice = calcMarketConversionPriceFromOraclePrice(
    baseOraclePrice,
    quoteOraclePrice,
  );
  const displayOracleConversionPrice = toXStocksDisplayPrice(
    rawOracleConversionPrice,
    exchangeRate,
  );
  return triggerPrice.gt(displayOracleConversionPrice)
    ? 'oracle_price_above'
    : 'oracle_price_below';
}
