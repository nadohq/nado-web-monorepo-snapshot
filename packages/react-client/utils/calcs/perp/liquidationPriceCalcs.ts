import { BigNumber } from 'bignumber.js';
import { AnnotatedPerpBalanceWithProduct } from '../../../context/metadata/productMetadata/types';

interface CalcEstimatedLiquidationPriceParams {
  maintHealth: BigNumber;
  amount: BigNumber;
  oraclePrice: BigNumber;
  longWeightMaintenance: BigNumber;
  shortWeightMaintenance: BigNumber;
}

/**
 * Calculates the estimated liquidation price of a perp position
 *
 * If long: oracle_price - (maintHealth / amount / long_weight)
 * If short: oracle_price + (maintHealth / amount / short_weight)
 *    note: delta(oracle price -> liq price) for the same maint health is different
 *    depending on long vs short. long weight < 1, short weight > 1, so the delta is greater for long than short
 *    this doesn't make sense to me but it's how the backend is implemented currently.
 *
 * If long_weight -> 0 then liquidation price approaches -inf, if short_weight -> inf then liquidation price approaches +inf.
 * null is returned in case liq price goes to -inf (<= 0) or +inf (10 times the oracle price) or balance amount is 0
 */
export function calcEstimatedLiquidationPrice({
  maintHealth,
  amount,
  oraclePrice,
  longWeightMaintenance,
  shortWeightMaintenance,
}: CalcEstimatedLiquidationPriceParams) {
  // If balance amount is 0 return null.
  if (amount.isZero()) {
    return null;
  }
  // If balance amount is positive.
  else if (amount.isPositive()) {
    const longLiquidationPrice = oraclePrice.minus(
      maintHealth.div(amount).div(longWeightMaintenance),
    );

    // If liquidation price is 0 or less return null instead of -inf.
    if (longLiquidationPrice.lte(0)) {
      return null;
    }

    return longLiquidationPrice;
  }
  // If balance amount is negative.
  else {
    const shortLiquidationPrice = oraclePrice.plus(
      maintHealth.div(amount.abs()).div(shortWeightMaintenance),
    );

    // If liquidation price is 10 times the oracle price return undefined instead of going to inf.
    if (shortLiquidationPrice.gte(oraclePrice.times(10))) {
      return null;
    }

    return shortLiquidationPrice;
  }
}

/**
 * Util fn for calculating the estimated liquidation price of a perp position using calcEstimatedLiquidationPrice
 *
 * @param balanceWithProduct
 * @param maintHealth
 */
export function calcEstimatedLiquidationPriceFromBalance(
  balanceWithProduct: AnnotatedPerpBalanceWithProduct,
  maintHealth: BigNumber,
): BigNumber | null {
  return calcEstimatedLiquidationPrice({
    maintHealth,
    amount: balanceWithProduct.amount,
    oraclePrice: balanceWithProduct.oraclePrice,
    longWeightMaintenance: balanceWithProduct.longWeightMaintenance,
    shortWeightMaintenance: balanceWithProduct.shortWeightMaintenance,
  });
}
