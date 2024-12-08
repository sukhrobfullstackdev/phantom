import { useDomEvent, usePrevious } from 'usable-react';
import { useState, useCallback } from 'react';

interface UseMouseMoveHook {
  /** The current mouse X position. */
  x: number;
  /** The current mouse Y position. */
  y: number;
  /** The previous mouse X position. */
  px: number;
  /** The previous mouse Y position. */
  py: number;
  /** The current `mousemove` event. */
  event?: MouseEvent;
}

/**
 * Wraps `useDomEvent` from `usable-react` to save the current and previous
 * mouse positions as well as execute an event listener.
 */
export function useMouseMove(listener?: (event: MouseEvent) => any): UseMouseMoveHook {
  const addEvent = useDomEvent(document.documentElement);

  const [clientX, setClientX] = useState<number>(NaN);
  const [clientY, setClientY] = useState<number>(NaN);
  const [mouseEvent, setMouseEvent] = useState<MouseEvent | undefined>(undefined);

  const prevClientX = usePrevious<number | undefined>(clientX);
  const prevClientY = usePrevious<number | undefined>(clientY);

  addEvent('mousemove', e => {
    setClientX(e.clientX);
    setClientY(e.clientY);
    setMouseEvent(e);
    if (listener) listener(e);
  });

  return {
    x: clientX,
    y: clientY,
    px: prevClientX ?? NaN,
    py: prevClientY ?? NaN,
    event: mouseEvent,
  };
}

type UnwrapArray<T> = T extends Array<infer R> ? R : never;
type GetEventTypeFromHandler<T> = T extends React.EventHandler<infer R> ? R : never;

/**
 * Compose multiple React event handlers into one.
 */
export function useComposedEventHandler<T extends (React.EventHandler<any> | undefined)[]>(...handlers: T) {
  return useCallback(
    (e: GetEventTypeFromHandler<UnwrapArray<T>>) => {
      handlers.forEach(handler => {
        if (handler) handler(e);
      });
    },

    [...handlers],
  );
}
