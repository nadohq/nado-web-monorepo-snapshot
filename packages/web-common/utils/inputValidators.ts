import { z } from 'zod';

// string = error message, undefined = no error
export type InputValidatorFn<T, TError extends string = string> = (
  val: T,
) => TError | undefined;

// Validator that just enforces the value be positive
export const positiveNumberValidator = z.preprocess(
  (val) => parseFloat(val as string),
  z.number().positive(),
);

// 0 <= val <= 1 validator for fraction inputs
export const fractionValidator = z.number().gte(0).lte(1);

// Validator that just enforces the value be an Email address
export const emailValidator = z.string().email();
