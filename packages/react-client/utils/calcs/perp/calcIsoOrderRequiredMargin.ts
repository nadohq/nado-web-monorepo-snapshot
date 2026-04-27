import { BigNumbers } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

interface Params {
  isMarketOrder: boolean;
  leverage: number;
  marketMaxLeverage: number;
  /**
   * IMPORTANT: this must be signed amount (negative for shorts)
   */
  assetAmountWithSign: BigNumber;
  orderPrice: BigNumber;
  oraclePrice: BigNumber | undefined;
  /** When true, no margin is transferred (reducing an existing isolated position) */
  isReducingIsoPosition: boolean | undefined;
}

export function calcIsoOrderRequiredMargin({
  isMarketOrder,
  leverage: userDefinedLeverage,
  marketMaxLeverage,
  assetAmountWithSign,
  orderPrice,
  oraclePrice,
  isReducingIsoPosition,
}: Params): BigNumber {
  // No margin transfer when reducing an existing isolated position
  if (isReducingIsoPosition) {
    return BigNumbers.ZERO;
  }
  // Stale data / rounding issues can make calculation at max leverage tricky, so max out at 0.2 below max leverage
  const leverage = Math.min(userDefinedLeverage, marketMaxLeverage - 0.2);

  // Use est. execution price to get the est. notional
  const marginWithoutInitialPnl = assetAmountWithSign
    .multipliedBy(orderPrice)
    .dividedBy(leverage)
    .abs();

  // When orderbook deviates from oracle price, market orders can
  // cause the health of the isolated position to drop due to
  // an inaccurate estimation of position value at entry. We require the health of the position to be >0
  //
  // health = margin + oracle_price * amount * weight - entry_price * amount > 0
  // therefore margin > amount * (entry_price - oracle_price) * weight
  //
  // If oracle_price = entry_price + delta, then:
  // margin > amount * (entry_price - (entry_price + delta)) * weight
  // margin adjustment is > - amount * delta * weight
  //
  // Weight is the weight associated with leverage, so:
  // long weight = 1 - 1 / leverage for long positions
  // short weight = 1 + 1 / leverage for short positions
  const takerMarginAdjustment = (() => {
    if (!isMarketOrder || !oraclePrice) {
      // This adjustment is only applied for market orders, as we can't predict
      // oracle price at the time of limit order execution
      return BigNumbers.ZERO;
    }

    const weight = assetAmountWithSign.isPositive()
      ? 1 - 1 / leverage
      : 1 + 1 / leverage;
    return assetAmountWithSign
      .negated()
      .multipliedBy(oraclePrice.minus(orderPrice))
      .multipliedBy(weight);
  })();

  // We only add margin as a result of any expected negative PnL. (i.e. add additional margin to offset negative PnL)
  // We don't subtract margin for expected positive PnL to be safe.
  // (We don't want orders to fail due to insufficient margin if we have a small error in calculation)
  const margin = marginWithoutInitialPnl.plus(
    BigNumber.max(takerMarginAdjustment, BigNumbers.ZERO),
  );

  return margin;
}
