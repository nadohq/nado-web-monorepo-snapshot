import { ChangeEvent, ChangeEventHandler, useCallback } from 'react';

/**
 * Removes commas and any characters except digits, decimal points, and dashes.
 *
 * @param value - Raw string from the input field.
 * @returns Sanitized numeric string (positive or negative) safe to pass to parsers like BigNumber.
 *
 * @example
 * sanitizeNumericString('1,234.56'); // "1234.56"
 * sanitizeNumericString('-123.45'); // "-123.45"
 * sanitizeNumericString('-.5'); // "-.5"
 * sanitizeNumericString('5.'); // "5."
 */
function sanitizeNumericString(value: string) {
  return value.replace(/[^\d.-]/g, '');
}

/**
 * Returns a memoized change handler that sanitizes numeric input before passing
 * the event to an optional onChange callback.
 *
 * This hook removes commas and any characters except digits, decimal points, and dashes
 * by mutating `event.target.value` before calling the original onChange.
 *
 * @param onChange - Optional change handler to call after sanitization.
 * @returns A memoized change event handler with built-in numeric sanitization.

 */
export function useSanitizedNumericOnChange(
  onChange?: ChangeEventHandler<HTMLInputElement>,
): ChangeEventHandler<HTMLInputElement> {
  return useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.target.value = sanitizeNumericString(event.target.value);
      onChange?.(event);
    },
    [onChange],
  );
}
