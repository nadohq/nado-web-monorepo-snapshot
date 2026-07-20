import { BigNumber } from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';

/**
 * Compute the change between the latest and previous value.
 *
 * @param latestValue - The latest value
 * @returns The change from the previous value to the latest value, or undefined if not enough data
 */
export function useLatestValueChange(
  latestValue?: BigNumber,
): BigNumber | undefined {
  const latestValueRef = useRef<BigNumber>(undefined);

  const [latestValueChange, setLatestValueChange] = useState<BigNumber>();

  useEffect(() => {
    // If cached value doesn't exist, store the latest value so we can compare it to the new value.
    if (latestValueRef.current === undefined) {
      latestValueRef.current = latestValue;
      return;
    }

    // Return early if the latest value is the same as the previous value
    if (latestValue?.eq(latestValueRef.current)) {
      return;
    }

    // Calculate the change between this (latest) value and the cached previous value.
    setLatestValueChange(latestValue?.minus(latestValueRef.current));
    latestValueRef.current = latestValue;
  }, [latestValue]);

  return latestValueChange;
}
