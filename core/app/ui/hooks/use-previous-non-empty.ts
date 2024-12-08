import { useEffect, useRef } from 'react';

/**
 * Just like `usePrevious` from `usable-react`,
 * but only saves the most recent non-empty value.
 */
export function usePreviousNonEmpty<T>(value?: T) {
  const prevRef = useRef<T>();

  useEffect(() => {
    if (value != null) {
      prevRef.current = value;
    }
  }, [value]);

  return prevRef.current;
}
