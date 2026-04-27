import { useEffect, useRef } from 'react';

/**
 * Creates a ref that has a `.current` synced to the latest value of `value`.
 * Useful for omitting a piece of state from a react hook dependency array
 * @param value The value to keep synced in the ref
 * @returns A ref object with current value synced to the input value
 */
export function useSyncedRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
