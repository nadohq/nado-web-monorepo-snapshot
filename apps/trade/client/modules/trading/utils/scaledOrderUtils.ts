import { BalanceSide, BigNumberish, toBigNumber } from '@nadohq/client';
import { calcIsoOrderRequiredMargin } from '@nadohq/react-client';
import { safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { ExecutePlaceOrderIsolatedParams } from 'client/hooks/execute/placeOrder/types';
import {
  SCALED_ORDER_MAX_NUMBER_OF_ORDERS,
  SCALED_ORDER_MIN_NUMBER_OF_ORDERS,
} from 'client/modules/trading/consts/scaledOrder';
import {
  OrderFormScaledOrderPriceDistributionType,
  OrderFormScaledOrderSizeDistributionType,
  RoundAmountFn,
  RoundPriceFn,
} from 'client/modules/trading/types/orderFormTypes';
import { getRangeBigNumberValidator } from 'client/utils/inputValidators';
import { range } from 'lodash';

/**
 * Calculates the worst case execution price for a scaled order based on order side.
 *
 * For scaled orders, the "worst case" price depends on the order direction:
 * - **Long orders**: Worst case is the highest price (max), as you'll pay more
 * - **Short orders**: Worst case is the lowest price (min), as you'll receive less
 *
 * @param startPrice - The starting price of the scaled order range (undefined if not set)
 * @param endPrice - The ending price of the scaled order range (undefined if not set)
 * @param orderSide - The order direction ('long' for buy, 'short' for sell)
 * @returns The worst case price for the given order side, or undefined if prices are not provided
 *
 * @example
 * // Long order from 90 to 100: worst case is 100 (highest price to pay)
 * getScaledOrderWorstCasePrice(90, 100, 'long') // returns 100
 *
 * // Short order from 90 to 100: worst case is 90 (lowest price to receive)
 * getScaledOrderWorstCasePrice(90, 100, 'short') // returns 90
 *
 * // Missing prices return undefined
 * getScaledOrderWorstCasePrice(undefined, 100, 'long') // returns undefined
 */
export function getScaledOrderWorstCasePrice(
  startPrice: BigNumber | undefined,
  endPrice: BigNumber | undefined,
  orderSide: BalanceSide,
): BigNumber | undefined {
  if (!startPrice || !endPrice) {
    return undefined;
  }
  return orderSide === 'long'
    ? BigNumber.max(startPrice, endPrice)
    : BigNumber.min(startPrice, endPrice);
}

/**
 * Calculates the base amount for a given size distribution type.
 * The base amount is the smallest unit that gets multiplied by weights.
 *
 * Weight distribution:
 * - 'evenly_split': All orders have equal weight [1, 1, ..., 1], sum = n
 * - 'increasing'/'decreasing': Arithmetic progression [1, 2, 3, ..., n], sum = n(n+1)/2
 *
 * @param orderAssetAmount - The total order asset amount to distribute
 * @param numberOfOrders - The total number of orders
 * @param sizeDistributionType - The type of distribution
 * @returns The base amount (orderAssetAmount / sumOfWeights)
 */
function calcBaseAmountForSizeDistribution(
  orderAssetAmount: BigNumber,
  numberOfOrders: number,
  sizeDistributionType: OrderFormScaledOrderSizeDistributionType,
): BigNumber {
  const sumOfWeights = (() => {
    switch (sizeDistributionType) {
      case 'evenly_split':
        // All orders have equal weight; modeled as weights [1, 1, ..., 1]
        // sum_of_weights = n
        return numberOfOrders;
      case 'increasing':
      case 'decreasing':
        // Both use arithmetic progression with weights [1, 2, 3, ..., n]
        // sum_of_weights = n(n + 1) / 2
        return (numberOfOrders * (numberOfOrders + 1)) / 2;
    }
  })();

  return orderAssetAmount.div(sumOfWeights);
}

interface CalcScaledOrderSmallestSuborderAssetAmountParams {
  orderAssetAmount: BigNumber;
  numberOfOrders: BigNumber | undefined;
  sizeDistributionType: OrderFormScaledOrderSizeDistributionType;
  roundAssetAmount: RoundAmountFn;
}

/**
 * Calculates the smallest suborder asset amount for validation purposes.
 *
 * For weighted distributions (increasing/decreasing), the minimum order is always
 * the one with weight=1 in the arithmetic progression [1, 2, 3, ..., n].
 *
 * Distribution behavior:
 * - 'evenly_split': All orders have equal size (total / n)
 * - 'increasing': Sizes grow from small to large (min is first order, weight=1)
 * - 'decreasing': Sizes shrink from large to small (min is last order, weight=1)
 *
 * @param params - Calculation parameters
 * @returns The smallest possible suborder asset amount for the given distribution type, or undefined if inputs are invalid
 */
export function calcScaledOrderSmallestSuborderAssetAmount({
  orderAssetAmount,
  numberOfOrders,
  sizeDistributionType,
  roundAssetAmount,
}: CalcScaledOrderSmallestSuborderAssetAmountParams): BigNumber | undefined {
  if (!numberOfOrders) {
    return;
  }

  const baseAmount = calcBaseAmountForSizeDistribution(
    orderAssetAmount,
    numberOfOrders.toNumber(),
    sizeDistributionType,
  );

  // Smallest suborder asset amount = base amount (weight=1)
  return roundAssetAmount(baseAmount);
}

/**
 * Optional params for calculating isolated margin per suborder.
 * When provided, each suborder will include its own iso margin based on its amount and order price.
 */
export interface BuildScaledOrdersIsoParams {
  /** Leverage for isolated margin calculation */
  leverage: number;
  /** Whether to allow borrowing margin */
  borrowMargin: boolean;
  /** When true, no margin is transferred (reducing an existing isolated position) */
  isReducingIsoPosition: boolean;
  /** Max leverage for the market */
  marketMaxLeverage: number;
}

interface BuildScaledOrdersParams {
  startPrice: BigNumberish | undefined;
  endPrice: BigNumberish | undefined;
  orderAssetAmount: BigNumberish | undefined;
  numberOfOrders: BigNumberish | undefined;
  priceDistributionType: OrderFormScaledOrderPriceDistributionType;
  sizeDistributionType: OrderFormScaledOrderSizeDistributionType;
  roundPrice: RoundPriceFn;
  roundAssetAmount: RoundAmountFn;
  /** Isolated margin params - when provided, calculates margin per suborder */
  iso: BuildScaledOrdersIsoParams | undefined;
}

export interface BuildScaledOrdersResultItem {
  price: BigNumber;
  amount: BigNumber;
  /** Isolated margin params for this suborder, undefined if iso was not provided */
  iso: ExecutePlaceOrderIsolatedParams | undefined;
}
/**
 * Generates complete scaled orders with prices and sizes ready for submission.
 * Respects the ordering of start and end prices (start → end).
 *
 * The start and end prices can be in any order (ascending or descending).
 * Orders are always returned in start-to-end order, regardless of price direction.
 *
 * @param params - Configuration for scaled orders
 * @returns Array of orders with price and amount as BigNumber (rounded to increments)
 */
export function buildScaledOrders({
  startPrice,
  endPrice,
  orderAssetAmount,
  numberOfOrders,
  priceDistributionType,
  sizeDistributionType,
  roundPrice,
  roundAssetAmount,
  iso,
}: BuildScaledOrdersParams): BuildScaledOrdersResultItem[] | undefined {
  if (!startPrice || !endPrice || !orderAssetAmount) {
    return;
  }

  const validatedNumberOfOrders = safeParseForData(
    getRangeBigNumberValidator({
      minInclusive: SCALED_ORDER_MIN_NUMBER_OF_ORDERS,
      maxInclusive: SCALED_ORDER_MAX_NUMBER_OF_ORDERS,
    }),
    numberOfOrders,
  )?.toNumber();

  if (!validatedNumberOfOrders) {
    return;
  }

  // Generate price levels based on distribution
  const priceLevels = getScaledOrderPriceLevels({
    startPrice: toBigNumber(startPrice),
    endPrice: toBigNumber(endPrice),
    numberOfOrders: validatedNumberOfOrders,
    priceDistributionType,
    roundPrice,
  });

  // Generate order amount distribution based on distribution type
  const orderAmountDistribution = getScaledOrderAmountDistribution({
    orderAssetAmount: toBigNumber(orderAssetAmount),
    numberOfOrders: validatedNumberOfOrders,
    sizeDistributionType,
    roundAssetAmount,
  });

  // Build orders array with rounded values
  return priceLevels.map((price, index) => {
    const amount = orderAmountDistribution[index];

    // Calculate isolated margin per suborder
    // Each suborder's margin = |suborder_amount * suborder_price / leverage|
    const isoParams: ExecutePlaceOrderIsolatedParams | undefined = iso
      ? {
          margin: calcIsoOrderRequiredMargin({
            // Scaled orders are always limit orders.
            isMarketOrder: false,
            leverage: iso.leverage,
            assetAmountWithSign: amount,
            // Use the suborder's actual price as the execution price.
            orderPrice: price,
            // Oracle price is not used for scaled orders as these are not market orders.
            oraclePrice: undefined,
            isReducingIsoPosition: iso.isReducingIsoPosition,
            marketMaxLeverage: iso.marketMaxLeverage,
          }),
          borrowMargin: iso.borrowMargin,
        }
      : undefined;

    return {
      price,
      amount,
      iso: isoParams,
    };
  });
}

interface GetScaledOrderAmountDistributionParams {
  orderAssetAmount: BigNumber;
  numberOfOrders: number;
  sizeDistributionType: OrderFormScaledOrderSizeDistributionType;
  roundAssetAmount: RoundAmountFn;
}

/**
 * Distributes order asset amount across orders based on distribution type
 * @param params - Parameters for the distribution
 */
function getScaledOrderAmountDistribution({
  orderAssetAmount,
  numberOfOrders,
  sizeDistributionType,
  roundAssetAmount,
}: GetScaledOrderAmountDistributionParams): BigNumber[] {
  switch (sizeDistributionType) {
    case 'evenly_split':
      // Equal amount for all orders
      return getEvenAmountDistribution({
        orderAssetAmount,
        numberOfOrders,
        roundAssetAmount,
        sizeDistributionType,
      });
    case 'increasing':
    case 'decreasing':
      // Weighted distribution (smaller to larger or larger to smaller)
      return getWeightedAmountDistribution({
        orderAssetAmount,
        numberOfOrders,
        sizeDistributionType,
        roundAssetAmount,
      });
  }
}

interface GetEvenAmountDistributionParams {
  orderAssetAmount: BigNumber;
  numberOfOrders: number;
  roundAssetAmount: RoundAmountFn;
  sizeDistributionType: Extract<
    OrderFormScaledOrderSizeDistributionType,
    'evenly_split'
  >;
}

/**
 * Distributes asset amount evenly across all orders
 * Applies rounding (truncation) to each order amount
 */
function getEvenAmountDistribution({
  orderAssetAmount,
  numberOfOrders,
  roundAssetAmount,
  sizeDistributionType,
}: GetEvenAmountDistributionParams): BigNumber[] {
  const amountPerOrder = calcBaseAmountForSizeDistribution(
    orderAssetAmount,
    numberOfOrders,
    sizeDistributionType,
  );

  // Apply rounding to each order (this truncates to size increment with ROUND_DOWN)
  return range(numberOfOrders).map(() => roundAssetAmount(amountPerOrder));
}

interface GetWeightedAmountDistributionParams {
  orderAssetAmount: BigNumber;
  numberOfOrders: number;
  sizeDistributionType: Extract<
    OrderFormScaledOrderSizeDistributionType,
    'increasing' | 'decreasing'
  >;
  roundAssetAmount: RoundAmountFn;
}

/**
 * Distributes asset amount with linear weighting (arithmetic progression)
 * Formula: quantity[i] = base_quantity × multiplier[i]
 * Where multipliers are: 1, 2, 3, ..., n (increasing) or n, n-1, ..., 2, 1 (decreasing)
 * Applies rounding (truncation) to each order amount
 */
function getWeightedAmountDistribution({
  orderAssetAmount,
  numberOfOrders,
  sizeDistributionType,
  roundAssetAmount,
}: GetWeightedAmountDistributionParams): BigNumber[] {
  // Step 1: Calculate base amount (the multiplier for weight=1)
  const baseAmount = calcBaseAmountForSizeDistribution(
    orderAssetAmount,
    numberOfOrders,
    sizeDistributionType,
  );

  // Step 2: Generate weights [1, 2, 3, ..., n]
  const weights = range(1, numberOfOrders + 1);

  // Step 3: Calculate ideal amounts and apply truncation (ROUND_DOWN)
  const orderAmounts = weights.map((weight) =>
    roundAssetAmount(baseAmount.times(weight)),
  );

  // Step 4: Return amounts - ascending for 'increasing', reversed for 'decreasing'
  return sizeDistributionType === 'increasing'
    ? orderAmounts
    : orderAmounts.reverse();
}

interface GetScaledOrderPriceLevelsParams {
  startPrice: BigNumber;
  endPrice: BigNumber;
  numberOfOrders: number;
  priceDistributionType: OrderFormScaledOrderPriceDistributionType;
  roundPrice: RoundPriceFn;
}

/**
 * Generates price levels based on distribution type.
 * Respects the ordering of start and end prices (start → end).
 * @param params - Parameters for the price levels
 * @returns Array of price levels ordered from start to end
 */
function getScaledOrderPriceLevels({
  startPrice,
  endPrice,
  numberOfOrders,
  priceDistributionType,
  roundPrice,
}: GetScaledOrderPriceLevelsParams): BigNumber[] {
  switch (priceDistributionType) {
    case 'flat':
      // Evenly spaced prices from start to end
      return getFlatPriceLevels({
        startPrice,
        endPrice,
        numberOfOrders,
        roundPrice,
      });
    case 'increasing':
    case 'decreasing':
      // Weighted price distribution (accelerating or decelerating)
      return getWeightedPriceLevels({
        startPrice,
        endPrice,
        numberOfOrders,
        priceDistributionType,
        roundPrice,
      });
  }
}

interface GetWeightedPriceLevelsParams {
  startPrice: BigNumber;
  endPrice: BigNumber;
  numberOfOrders: number;
  priceDistributionType: Extract<
    OrderFormScaledOrderPriceDistributionType,
    'increasing' | 'decreasing'
  >;
  roundPrice: RoundPriceFn;
}

/**
 * Generates geometric price distribution from start to end.
 * Respects the ordering of start/end prices while applying the distribution:
 * - 'increasing': gaps increase from start → end (prices cluster at start)
 * - 'decreasing': gaps decrease from start → end (prices cluster at end)
 *
 * Uses geometric progression as the base, then transforms to achieve
 * the desired distribution direction.
 */
function getWeightedPriceLevels({
  startPrice,
  endPrice,
  numberOfOrders,
  priceDistributionType,
  roundPrice,
}: GetWeightedPriceLevelsParams): BigNumber[] {
  const isAscending = startPrice.lt(endPrice);

  // Get min and max for the geometric calculation
  const [minPrice, maxPrice] = isAscending
    ? [startPrice, endPrice]
    : [endPrice, startPrice];

  // Step 1: Calculate the common ratio (r) for geometric progression
  // ratio = (max_price / min_price) ^ (1 / (n - 1))
  // This is always > 1 since max > min
  const priceRatio = maxPrice.div(minPrice);
  const exponent = toBigNumber(1).div(numberOfOrders - 1);
  const ratio = toBigNumber(
    Math.exp(exponent.toNumber() * Math.log(priceRatio.toNumber())),
  );

  // Step 2: Generate base geometric progression from min to max
  // This naturally has increasing gaps (gaps grow toward max)
  const baseProgression = range(numberOfOrders).map((i) =>
    minPrice.times(ratio.pow(i)),
  );

  // Step 3: Transform based on direction and distribution type
  // Base progression: [min, ..., max] with gaps INCREASING toward max
  //
  // Transforms:
  // - mirror(p) = min + max - p : flips direction, preserves gap pattern
  // - reverse: flips direction AND inverts gap pattern
  //
  // Truth table:
  // | Direction  | Distribution | Want gaps toward end | Transform needed    |
  // |------------|--------------|---------------------|---------------------|
  // | ascending  | increasing   | increasing          | none                |
  // | ascending  | decreasing   | decreasing          | reverse + mirror    |
  // | descending | increasing   | increasing          | mirror              |
  // | descending | decreasing   | decreasing          | reverse             |
  const transformedPrices = (() => {
    const priceSum = minPrice.plus(maxPrice);
    const mirror = (prices: BigNumber[]) =>
      prices.map((p) => priceSum.minus(p));

    if (isAscending) {
      // Want: [start=min, ..., end=max]
      if (priceDistributionType === 'increasing') {
        // Base already has increasing gaps toward max (end)
        return baseProgression;
      }
      // Need decreasing gaps toward max - reverse inverts gaps, mirror restores direction
      return mirror(baseProgression.reverse());
    }

    // Want: [start=max, ..., end=min]
    if (priceDistributionType === 'increasing') {
      // Mirror preserves gap magnitudes [19,22,27,32] while flipping direction
      // Result: gaps still increase left-to-right, which is toward end (min)
      return mirror(baseProgression);
    }

    // Reverse flips both direction and gap pattern
    // Result: gaps [32,27,22,19] decrease toward end (min)
    return baseProgression.reverse();
  })();

  // Step 4: Apply rounding
  return transformedPrices.map((p) => roundPrice(p));
}

interface GetFlatPriceLevelsParams {
  startPrice: BigNumber;
  endPrice: BigNumber;
  numberOfOrders: number;
  roundPrice: RoundPriceFn;
}

/**
 * Generates evenly spaced prices from startPrice to endPrice.
 * Uses linear progression: price[i] = start_price + (step * i)
 * Where: step = (end_price - start_price) / (n - 1)
 * Works for both ascending (start < end) and descending (start > end) directions.
 */
function getFlatPriceLevels({
  startPrice,
  endPrice,
  numberOfOrders,
  roundPrice,
}: GetFlatPriceLevelsParams): BigNumber[] {
  // Step 1: Calculate the step size (can be negative for descending)
  const step = endPrice.minus(startPrice).div(numberOfOrders - 1);

  // Step 2: Generate prices using linear progression
  // price[i] = start_price + (step * i)
  return range(numberOfOrders).map((i) =>
    roundPrice(startPrice.plus(step.times(i))),
  );
}
