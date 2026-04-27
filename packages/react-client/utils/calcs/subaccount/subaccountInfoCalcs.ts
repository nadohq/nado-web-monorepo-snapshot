import {
  BalanceWithProduct,
  BigNumbers,
  calcPerpBalanceNotionalValue,
  calcPerpBalanceValue,
  calcSpotBalanceValue,
  ProductEngineType,
  QUOTE_PRODUCT_ID,
  SubaccountSummaryState,
  sumBigNumberBy,
} from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

export interface TotalPortfolioValues {
  // spot + perpNotional
  totalNotional: BigNumber;
  // spot + perp
  netTotal: BigNumber;
  // Net spot value
  spot: BigNumber;
  // This is the notional value of the position
  perpNotional: BigNumber;
  // Indicates the value of the perp position, which is notional value of the position minus the entry cost and funding.
  // This is the same as PnL
  perp: BigNumber;
}

/**
 * Return total portfolio values in terms of quote
 *
 * @param summary
 */
export function calcTotalPortfolioValues(
  summary: SubaccountSummaryState,
): TotalPortfolioValues {
  const values: TotalPortfolioValues = {
    netTotal: BigNumbers.ZERO,
    spot: BigNumbers.ZERO,
    perp: BigNumbers.ZERO,
    perpNotional: BigNumbers.ZERO,
    totalNotional: BigNumbers.ZERO,
  };

  summary.balances.forEach((balance) => {
    if (balance.type === ProductEngineType.SPOT) {
      const value = calcSpotBalanceValue(balance);

      values.spot = values.spot.plus(value);
    } else if (balance.type === ProductEngineType.PERP) {
      const notional = calcPerpBalanceNotionalValue(balance);
      const value = calcPerpBalanceValue(balance);

      values.perpNotional = values.perpNotional.plus(notional);
      values.perp = values.perp.plus(value);
    }
  });

  values.netTotal = values.spot.plus(values.perp);
  values.totalNotional = values.spot.plus(values.perpNotional);

  return values;
}

/**
 * Leverage calculated as sum(abs(unweighted health for non-quote balances)) / unweighted health
 *
 * @param summary
 */
export function calcSubaccountLeverage(summary: SubaccountSummaryState) {
  const unweightedHealth =
    calcUnweightedHealthExcludingZeroHealthProducts(summary);

  if (unweightedHealth.isZero()) {
    return BigNumbers.ZERO;
  }
  if (!hasBorrowsOrPerps(summary)) {
    return BigNumbers.ZERO;
  }

  const numerator = sumBigNumberBy(summary.balances, (balance) => {
    if (balance.productId === QUOTE_PRODUCT_ID || isZeroHealth(balance)) {
      return BigNumbers.ZERO;
    }
    const balanceValue =
      balance.type === ProductEngineType.SPOT
        ? calcSpotBalanceValue(balance).abs()
        : calcPerpBalanceNotionalValue(balance);
    return balanceValue;
  });

  return numerator.dividedBy(unweightedHealth);
}

export interface MarginUsageFractions {
  maintenance: BigNumber;
  initial: BigNumber;
}

/**
 * Calculate margin usage fractions bounded to [0, 1]
 * unbounded margin usage = (unweighted health - initial/maint health) / unweighted health
 * iff subaccount has borrows or perp positions, and 0 otherwise.
 *
 * @param summary
 */
export function calcSubaccountMarginUsageFractions(
  summary: SubaccountSummaryState,
): MarginUsageFractions {
  const unweightedHealth =
    calcUnweightedHealthExcludingZeroHealthProducts(summary);
  const initialHealth = summary.health.initial.health;
  const maintenanceHealth = summary.health.maintenance.health;

  const zeroMarginUsage: MarginUsageFractions = {
    initial: BigNumbers.ZERO,
    maintenance: BigNumbers.ZERO,
  };

  if (unweightedHealth.isZero()) {
    return zeroMarginUsage;
  }
  if (!hasBorrowsOrPerps(summary)) {
    return zeroMarginUsage;
  }

  const initialMarginUsage = unweightedHealth
    .minus(initialHealth)
    .div(unweightedHealth);
  const maintMarginUsage = unweightedHealth
    .minus(maintenanceHealth)
    .div(unweightedHealth);

  // If the respective healths are negative, then already "underwater", so max out the margin usage
  return {
    initial: initialHealth.isNegative()
      ? BigNumbers.ONE
      : BigNumber.min(initialMarginUsage, 1),
    maintenance: maintenanceHealth.isNegative()
      ? BigNumbers.ONE
      : BigNumber.min(maintMarginUsage, 1),
  };
}

/**
 * Check if a subaccount has borrows or perp positions
 *
 * @param summary
 */
function hasBorrowsOrPerps(summary: SubaccountSummaryState) {
  for (const balance of summary.balances) {
    if (balance.amount.lt(0)) {
      // Either a spot borrow or a perp position
      return true;
    } else if (balance.type === ProductEngineType.PERP) {
      if (!balance.amount.isZero()) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Zero health products have a long weight of 0 and a short weight of 2 (i.e. borrows are disabled and deposits do not contribute health)
 * @param balance
 */
function isZeroHealth(balance: BalanceWithProduct) {
  return balance.longWeightInitial.eq(0) && balance.shortWeightInitial.eq(2);
}

/**
 * Calculates unweighted health excluding zero health products.
 * This is important for margin usage & leverage calculations, where we want to use this adjusted health
 *
 * @param summary
 */
function calcUnweightedHealthExcludingZeroHealthProducts(
  summary: SubaccountSummaryState,
) {
  let unweightedHealth = summary.health.unweighted.health;

  summary.balances.forEach((balance) => {
    if (isZeroHealth(balance)) {
      unweightedHealth = unweightedHealth.minus(
        balance.healthContributions.unweighted,
      );
    }
  });

  return unweightedHealth;
}
