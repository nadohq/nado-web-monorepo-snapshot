import { toBigNumber } from '@nadohq/client';
import { isPrivateKey } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { isString } from 'lodash';
import { Address, Hex, isAddress } from 'viem';
import { z } from 'zod';

export const addressValidator = z.custom<Address>(
  (value) => isString(value) && isAddress(value),
);

export const privateKeyValidator = z.custom<Hex>(
  (value) => isString(value) && isPrivateKey(value),
);

export const finiteBigNumberValidator = z
  .string()
  .refine((val) => {
    const parsed = toBigNumber(val);
    return parsed.isFinite();
  })
  .transform((val) => toBigNumber(val));

export const positiveBigNumberValidator = z
  .string()
  .refine((val) => {
    const parsed = toBigNumber(val);
    return parsed.isFinite() && parsed.gt(0);
  })
  .transform((val) => toBigNumber(val));

interface RangeValidatorOptions {
  minInclusive?: BigNumber.Value;
  maxInclusive?: BigNumber.Value;
  minExclusive?: BigNumber.Value;
  maxExclusive?: BigNumber.Value;
}

export const getRangeBigNumberValidator = ({
  maxExclusive,
  maxInclusive,
  minExclusive,
  minInclusive,
}: RangeValidatorOptions) => {
  return z
    .string()
    .refine((val) => {
      const parsed = toBigNumber(val);
      if (!parsed.isFinite()) {
        return;
      }

      if (maxExclusive != null && parsed.gte(maxExclusive)) {
        return;
      }
      if (maxInclusive != null && parsed.gt(maxInclusive)) {
        return;
      }
      if (minExclusive != null && parsed.lte(minExclusive)) {
        return;
      }
      if (minInclusive != null && parsed.lt(minInclusive)) {
        return;
      }

      return parsed;
    })
    .transform((val) => toBigNumber(val));
};
