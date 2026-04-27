import {
  addDecimals,
  BalanceSide,
  BigNumbers,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import { safeDiv } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useQueryMarketLiquidity } from 'client/hooks/query/markets/useQueryMarketLiquidity';
import { useQuerySubaccountFeeRates } from 'client/hooks/query/subaccount/useQuerySubaccountFeeRates';
import { first } from 'lodash';
import { useMemo } from 'react';

export interface EstimateEntryParams {
  productId: number | undefined;
  /** Limit price submitted to book */
  executionLimitPrice: BigNumber | undefined;
  /** Order side buy/sell */
  orderSide: BalanceSide;
  /** Validated asset amount */
  validAssetAmount: BigNumber | undefined;
}

export interface TradeEntryEstimate {
  /** Last price at which the order will be filled, i.e. the lowest price touched if sell, the highest price touched if buy*/
  lastFilledPrice: BigNumber;
  /** Weighted average fill price of the amount (includes both immediately filled and any resting on book)
   * The fill price of amount left on book is just the limit price itself
   */
  avgFillPrice: BigNumber;
  /** Weighted average fill price of ONLY the amount immediately filled */
  avgTakerFillPrice: BigNumber;
  /** Amount immediately filled (i.e. as a taker) */
  takerFilledAmount: BigNumber;
  /** Amount left on book (i.e. as a maker) */
  onBookAmount: BigNumber;
  /** Estimated fee (taker + maker) */
  estimatedFee: BigNumber;
  /** Estimated total cost of the order */
  estimatedTotal: BigNumber;
  /** Estimated slippage fraction */
  estimatedSlippageFraction: BigNumber;
}

export function useEstimateTradeEntry({
  executionLimitPrice,
  validAssetAmount,
  productId,
  orderSide,
}: EstimateEntryParams) {
  const { data: marketLiquidity } = useQueryMarketLiquidity({
    productId,
  });
  const { data: subaccountFeeRates } = useQuerySubaccountFeeRates();

  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const marketStaticData = productId
    ? allMarketsStaticData?.allMarkets[productId]
    : undefined;

  return useMemo((): TradeEntryEstimate | undefined => {
    if (
      !executionLimitPrice ||
      !validAssetAmount ||
      !marketLiquidity ||
      !subaccountFeeRates ||
      !marketStaticData
    ) {
      return;
    }

    const decimalAdjustedAmount = addDecimals(validAssetAmount);

    // Adjust signage depending if sell/short or buy/long
    const signAdjustedAmount =
      orderSide === 'long'
        ? decimalAdjustedAmount
        : decimalAdjustedAmount.negated();

    let initialAmountAbs = toBigNumber(signAdjustedAmount).abs();
    let currAmountAbs = initialAmountAbs;

    // Look at sell orders if buying, vice versa, assume these are sorted in order of book traversal (i.e. if buying, lowest price first)
    const liquidityLevels = signAdjustedAmount.isPositive()
      ? marketLiquidity.asks
      : marketLiquidity.bids;

    // We use the top-of-book price (best bid when buying, best ask when selling)
    // for calculating slippage. This reflects the actual market execution price including spread,
    // providing a more accurate slippage estimate relative to the market's best available price.
    const topOfBookPrice =
      first(
        signAdjustedAmount.isPositive()
          ? marketLiquidity.bids
          : marketLiquidity.asks,
      )?.price ?? BigNumbers.ZERO;

    let avgFillPrice = BigNumbers.ZERO;
    let lastFilledPrice = BigNumbers.ZERO;

    for (const level of liquidityLevels) {
      // No more relevant levels
      const pastSellLimitPrice =
        signAdjustedAmount.isNegative() && level.price.lt(executionLimitPrice);
      const pastBuyLimitPrice =
        signAdjustedAmount.isPositive() && level.price.gt(executionLimitPrice);
      if (pastSellLimitPrice || pastBuyLimitPrice || currAmountAbs.isZero()) {
        break;
      }

      // Amount filled at this book level
      const filledAmount = BigNumber.min(currAmountAbs, level.liquidity);

      // Update tracked vals
      // weighted average fill price += (filled/total) * price
      avgFillPrice = avgFillPrice.plus(
        filledAmount.div(initialAmountAbs).times(level.price),
      );
      lastFilledPrice = level.price;

      // Update amount still left
      currAmountAbs = currAmountAbs.minus(filledAmount);
    }

    // After this, rest is maker

    // If nothing was filled, default this to the limit price
    lastFilledPrice = lastFilledPrice.eq(0)
      ? executionLimitPrice
      : lastFilledPrice;
    const takerFilledAmount = initialAmountAbs.minus(currAmountAbs);

    // For readability, return early if the order was not filled at all as a taker, this means all of it is on book
    if (takerFilledAmount.isZero()) {
      return {
        onBookAmount: initialAmountAbs,
        avgFillPrice: executionLimitPrice,
        avgTakerFillPrice: executionLimitPrice,
        // Assume zero maker fees
        estimatedFee: BigNumbers.ZERO,
        estimatedTotal: removeDecimals(
          initialAmountAbs.multipliedBy(executionLimitPrice),
        ),
        estimatedSlippageFraction: BigNumbers.ZERO,
        lastFilledPrice,
        takerFilledAmount,
      };
    }

    // Avg fill price above is weighted by taker filled amount / total requested, so adjust accordingly
    const avgTakerFillPrice = avgFillPrice
      .multipliedBy(initialAmountAbs)
      .div(takerFilledAmount);
    const onBookAmount = currAmountAbs;

    if (onBookAmount.gt(0)) {
      // Calc such that the rest is filled at the last seen price
      avgFillPrice = avgFillPrice.plus(
        onBookAmount.div(initialAmountAbs).times(lastFilledPrice),
      );
    }

    const estimatedTradeFee = (() => {
      if (!productId) {
        return BigNumbers.ZERO;
      }

      const takerFeeRate = subaccountFeeRates.orders[productId].taker;

      // Assuming taker order, we need max of:
      // `minSize` * fee_rate
      // taker quote amount * fee_rate
      // The taker quote amount is the base amount times the avg fill price
      return BigNumber.max(
        marketStaticData.minSize.times(takerFeeRate),
        takerFilledAmount.times(avgTakerFillPrice).times(takerFeeRate),
      );
    })();

    const estimatedFee = estimatedTradeFee.plus(
      subaccountFeeRates.takerSequencerFee,
    );

    // Calculate estimated slippage fraction
    // abs((Executed Price - Expected Price)) / Expected Price)
    const estimatedSlippageFraction = safeDiv(
      avgTakerFillPrice.minus(topOfBookPrice).abs(),
      topOfBookPrice,
    );

    // Estimated total uses the avg fill across taker & maker
    // you get less USDT because of fee if selling, and spend more USDT if buying
    const estimatedTotal = initialAmountAbs
      .multipliedBy(avgFillPrice)
      .plus(
        signAdjustedAmount.isPositive() ? estimatedFee : estimatedFee.negated(),
      );

    return {
      onBookAmount: removeDecimals(onBookAmount),
      takerFilledAmount: removeDecimals(takerFilledAmount),
      // Average for taker fill price is 0 if none is filled, in which case, just use the limit price
      avgTakerFillPrice,
      avgFillPrice,
      estimatedFee: removeDecimals(estimatedFee),
      estimatedTotal: removeDecimals(estimatedTotal),
      estimatedSlippageFraction,
      lastFilledPrice,
    };
  }, [
    executionLimitPrice,
    validAssetAmount,
    marketLiquidity,
    subaccountFeeRates,
    marketStaticData,
    orderSide,
    productId,
  ]);
}
