import {
  BigNumberish,
  BigNumbers,
  removeDecimals,
  sumBigNumberBy,
  TimeInSeconds,
  toBigNumber,
} from '@nadohq/client';
import { safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { RoundAmountFn } from 'client/modules/trading/types/orderFormTypes';
import { getRangeBigNumberValidator } from 'client/utils/inputValidators';
import { roundToDecimalPlaces } from 'client/utils/rounding';
import { secondsToMilliseconds } from 'date-fns';
import { random, range, sum } from 'lodash';

interface GetTwapRandomOrderAmountsParams {
  /**
   * Number of orders to calculate the amounts for.
   */
  numberOfOrders: number;
  /**
   * Total amount to split across all orders.
   */
  orderAssetAmount: BigNumber;
  /**
   * Round amount
   */
  roundAssetAmount: RoundAmountFn;
  /**
   * Randomness fraction for the TWAP orders.
   */
  randomnessFraction: number;

  /**
   * Size increment for the market.
   */
  sizeIncrement: BigNumber | undefined;
}

/**
 * Calculates the order asset amounts for each TWAP order based on the numberOfOrders, orderAssetAmount.
 *
 * @param params - The parameters for the function.
 * @returns The amounts for each TWAP order.
 */
export function getTwapOrderAmounts({
  numberOfOrders,
  orderAssetAmount,
  roundAssetAmount,
  randomnessFraction,
  sizeIncrement,
}: GetTwapRandomOrderAmountsParams): BigNumber[] {
  // Generate random weights in [1 - r, 1 + r]
  const weights = range(numberOfOrders).map(() =>
    random(1 - randomnessFraction, 1 + randomnessFraction, true),
  );

  const weightsSum = sum(weights);

  // Scale weights to amounts so they sum to orderAssetAmount
  const amounts = weights.map((w) => orderAssetAmount.times(w).div(weightsSum));

  // Round asset amounts to the size increment
  const roundedAmounts = amounts.map(roundAssetAmount);

  if (!sizeIncrement) {
    return roundedAmounts;
  }

  // Calculate how much was lost from rounding down
  // Redistribute rounding difference back to orders
  const roundedTotal = sumBigNumberBy(roundedAmounts, (amount) => amount);
  const decimalAdjustedSizeIncrement = removeDecimals(sizeIncrement);

  let roundingDiff = orderAssetAmount.minus(roundedTotal);

  for (let i = 0; i < numberOfOrders; i++) {
    // If the rounding difference is zero, break the loop
    if (roundingDiff.isZero()) {
      break;
    }

    // If the rounding difference is positive, add the size increment to the order amount
    const orderAmountSizeAdjustment = roundingDiff.isPositive()
      ? decimalAdjustedSizeIncrement
      : decimalAdjustedSizeIncrement.negated();

    roundedAmounts[i] = roundedAmounts[i].plus(orderAmountSizeAdjustment);

    // Subtract the adjustment from the rounding difference
    roundingDiff = roundingDiff.minus(orderAmountSizeAdjustment);
  }

  return roundedAmounts;
}

interface CalcTwapSuborderAssetAmountParams {
  /**
   * The asset amount of the order.
   */
  orderAssetAmount: BigNumber | undefined;
  /**
   * The number of orders.
   */
  numberOfOrders: BigNumberish;
  /**
   * The function to round the asset amount.
   */
  roundAssetAmount: RoundAmountFn;
}

/**
 * Calculates the asset amount per suborder based on the order asset amount and the number of orders.
 *
 * @param params- The parameters for the function.
 * @returns
 */
export function calcTwapSuborderAssetAmount({
  orderAssetAmount,
  numberOfOrders,
  roundAssetAmount,
}: CalcTwapSuborderAssetAmountParams) {
  if (!orderAssetAmount) {
    return undefined;
  }

  return roundAssetAmount(orderAssetAmount.div(toBigNumber(numberOfOrders)));
}

interface DurationInput {
  hours: string;
  minutes: string;
}

/**
 * Calculates the number of TWAP orders based on the total duration and frequency.
 * Rounds down to the nearest integer.
 * We always want at least 1 order, even if the total duration is 0.
 *
 * @param totalDurationInSeconds Total duration in seconds.
 * @param frequencyInSeconds Interval between orders, in seconds.
 * @returns
 */
export function calcTwapNumberOfOrders(
  duration: DurationInput,
  frequencyInSeconds: BigNumberish,
): number {
  const totalDurationInSeconds = convertTwapDurationInputValuesToSeconds({
    hours: duration.hours,
    minutes: duration.minutes,
  });

  // We always want at least 1 order, even if the total duration is 0
  return roundToDecimalPlaces(
    totalDurationInSeconds.div(toBigNumber(frequencyInSeconds)),
    0,
    BigNumber.ROUND_DOWN,
  )
    .plus(BigNumbers.ONE)
    .toNumber();
}

/**
 * Converts a TWAP duration (hours and minutes) input values into seconds.
 *
 * Duration refers to the user-specified period over which orders should be spread,
 * independent of the actual runtime (elapsed time from first to last order).
 *
 * @param duration Input duration in hours and minutes.
 * @returns Duration in seconds as a BigNumber.
 */
function convertTwapDurationInputValuesToSeconds(
  duration: DurationInput,
): BigNumber {
  const validDurationHours = safeParseForData(
    getRangeBigNumberValidator({
      minInclusive: 0,
      maxInclusive: 24,
    }),
    duration.hours,
  );
  const validDurationMinutes = safeParseForData(
    getRangeBigNumberValidator({
      minInclusive: 0,
      maxInclusive: 59,
    }),
    duration.minutes,
  );

  return (validDurationHours ?? BigNumbers.ZERO)
    .times(TimeInSeconds.HOUR)
    .plus(
      (validDurationMinutes ?? BigNumbers.ZERO).times(TimeInSeconds.MINUTE),
    );
}

/**
 * Calculates the runtime of a TWAP order schedule in milliseconds.
 *
 * Runtime is the actual elapsed time from the first order to the last.
 * Since the first order is executed immediately, the runtime is:
 *   (numberOfOrders - 1) * frequency
 *
 * @param frequencyInSeconds Interval between consecutive orders, in seconds.
 * @param numberOfOrders Total number of orders in the TWAP schedule.
 * @returns The TWAP runtime in milliseconds.
 */
export function calculateTwapRuntimeInMillis(
  frequencyInSeconds: BigNumberish,
  numberOfOrders: number,
): number {
  return secondsToMilliseconds(
    toBigNumber(frequencyInSeconds)
      // We subtract 1 because the first order is executed immediately.
      .times(numberOfOrders - 1)
      .toNumber(),
  );
}
