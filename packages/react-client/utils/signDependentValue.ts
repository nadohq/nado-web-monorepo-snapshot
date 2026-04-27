import { BigNumberish, toBigNumber } from '@nadohq/client';

export interface SignValueMap<T> {
  positive: T;
  negative: T;
  zero: T;
  // If not given, uses the zero value
  undefined?: T;
}

export function signDependentValue<T>(
  value: BigNumberish | undefined,
  mapping: SignValueMap<T>,
): T {
  if (value == null) {
    return mapping.undefined ?? mapping.zero;
  }
  const bigNumberVal = toBigNumber(value);
  if (bigNumberVal.gt(0)) {
    return mapping.positive;
  } else if (bigNumberVal.lt(0)) {
    return mapping.negative;
  } else {
    return mapping.zero;
  }
}
