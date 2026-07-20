import { MouseEvent, MouseEventHandler, useEffect, useRef } from 'react';

interface Params<T> {
  handler: (count: number, event: MouseEvent<T> | null) => void;
  resetDelay?: number;
}

export function useRepeatedClickCountHandler<T = Element>({
  resetDelay = 200,
  handler,
}: Params<T>): MouseEventHandler<T> {
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up the timer on unmount
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return (e) => {
    count.current += 1;

    if (timer.current) {
      // If there's an existing timer, clear it as we start a new one
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      // If we didn't get another click within the reset delay, call the handler
      handler(count.current, e);
      count.current = 0;
    }, resetDelay);
  };
}
