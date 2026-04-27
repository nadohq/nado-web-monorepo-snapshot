import { z } from 'zod';

/**
 * Needed because base Zod cannot handle numeric enum types (such as ORDERBOOK_PRICE_TICK_SPACING_MULTIPLIERS)
 * @param values Array of numeric values to validate against
 * @returns Zod schema for validating numeric enum values
 */
export function zodNumericEnum<ValuesType extends readonly number[]>(
  values: ValuesType,
) {
  return z.number().refine((val) => values.includes(val)) as z.ZodType<
    ValuesType[number]
  >;
}

/**
 * Needed because JavaScript implicitly converts numeric object keys to strings, so convert them back to number
 * @returns Zod schema for validating and coercing numeric object keys
 */
export function zodNumericObjectKey() {
  return z
    .union([z.string(), z.number()])
    .transform(Number)
    .refine(Number.isFinite);
}

/**
 * Validates a value against a schema, returning the default value if validation fails
 * @param newValue The value to validate
 * @param defaultValue The default value to return if validation fails
 * @param valueSchema The Zod schema to validate against
 * @returns The validated value or the default value
 */
export function validateOrReset<ValueType>(
  newValue: ValueType | undefined,
  defaultValue: ValueType,
  valueSchema: z.ZodTypeAny,
): ValueType {
  const parsedNewValue = valueSchema.safeParse(newValue);

  return parsedNewValue.success
    ? (parsedNewValue.data as ValueType)
    : defaultValue;
}
