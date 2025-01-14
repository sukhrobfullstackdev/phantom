/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import React, { useRef, useState, useEffect, forwardRef, useCallback } from 'react';
import { watchResize, WatchResizePayload, DestroyWatchResizeObservable } from 'watch-resize';
import { isString, omit } from '~/app/libs/lodash-utils';
import { Subscription } from 'rxjs';
import composeRefs from '@seznam/compose-react-refs';
import { isBoolean } from 'util';
import { cssTimeToMilliseconds } from '../../../../libs/css-time-to-milliseconds';

interface TransitionStyles {
  transition: string;
  height: string;
  width: string;
  willChange: string;
}

interface TransitionConfig {
  duration?: string;
  timingFunction?: string;
  delay?: string;
}

interface FlexibleDivProps {
  initialDelay?: number;
  transition?: boolean | TransitionConfig;
  applyCSSVariables?: {
    element?: HTMLElement;
    transitionVar?: string;
    heightVar?: string;
    widthVar?: string;
  };
  onResize?: (
    payload: WatchResizePayload<HTMLElement> & {
      transitionStyles: TransitionStyles;
    },
  ) => void;
  whileTransitioning?: FrameRequestCallback;
  observerOnly?: boolean;
  autoWidth?: boolean;
  autoHeight?: boolean;
}

/**
 * This component is a container which automatically updates its `height` style
 * property based on the total size of its child nodes. This enables dynamic
 * transitional height behavior.
 */
export const FlexibleDiv = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & FlexibleDivProps>(
  (props, externalRef) => {
    // --- Data

    const contentElement = useRef<HTMLElement>();
    const [height, setHeight] = useState<string | number>('auto');
    const [width, setWidth] = useState<string | number>('auto');

    const isMounted = useRef(false);
    const isTransitioning = useRef(false);
    const raf = useRef<number | null>(null);

    // --- Utilities for handling `watch-resize` observer

    /**
     * Set the `containerElement` ref height based on the given element
     * or `contentElement` ref as a fallback.
     */
    const setContainerElementDimensions = useCallback(
      (domRect?: DOMRect) => {
        let rect = domRect;
        if (!rect) {
          if (contentElement.current) rect = contentElement.current.getBoundingClientRect();
          else return;
        }

        if (!props.autoHeight) {
          const nextHeight = Math.ceil(rect.height);
          if (nextHeight !== height) setHeight(`${nextHeight}px`);
        }

        if (!props.autoWidth) {
          const nextWidth = Math.ceil(rect.width);
          if (nextWidth !== width) setWidth(`${nextWidth}px`);
        }
      },
      [height, width],
    );

    /**
     * Build styles to transition height.
     */
    const buildTransitionStyles = useCallback(
      (heightOverride?: number, widthOverride?: number): TransitionStyles => {
        if (props.transition) {
          let transition = 'height 0.2s ease, width 0.2s ease';

          if (!isBoolean(props.transition)) {
            const { duration, timingFunction, delay } = props.transition;

            transition = `height${duration ? `${duration} ` : ' 0.2s'}${
              timingFunction ? `${timingFunction} ` : ' ease'
            }${delay ? `${delay} ` : ' 0s'}`;

            transition += `, width${duration ? `${duration} ` : ' 0.2s'}${
              timingFunction ? `${timingFunction} ` : ' ease'
            }${delay ? `${delay} ` : ' 0s'}`;
          }

          const resolvedHeightOverride = heightOverride ? `${Math.ceil(heightOverride)}px` : null;
          const resolvedHeight = isString(height) ? height : `${Math.ceil(Number(height))}px`;

          const resolvedWidthOverride = widthOverride ? `${Math.ceil(widthOverride)}px` : null;
          const resolvedWidth = isString(width) ? width : `${Math.ceil(Number(width))}px`;

          return {
            transition,
            height: props.autoHeight ? 'auto' : resolvedHeightOverride || resolvedHeight.toString(),
            width: props.autoWidth ? 'auto' : resolvedWidthOverride || resolvedWidth.toString(),
            willChange: 'height, width',
          };
        }

        return {
          transition: 'none',
          height: 'auto',
          width: 'auto',
          willChange: 'unset',
        };
      },
      [props.transition, height, width],
    );

    /**
     * Set CSS variables for the generated `transition` and `height` properties.
     */
    const applyCSSVariables = useCallback(
      (heightOverride?: number, widthOverride?: number) => {
        const { element, heightVar, widthVar, transitionVar } = props.applyCSSVariables!;
        const transitionStyles = buildTransitionStyles(heightOverride, widthOverride);
        const elementResolved = element || document.documentElement;

        if (heightVar)
          elementResolved.style.setProperty(heightVar, props.autoHeight ? 'auto' : transitionStyles.height);
        if (widthVar) elementResolved.style.setProperty(widthVar, props.autoWidth ? 'auto' : transitionStyles.width);
        if (transitionVar) elementResolved.style.setProperty(transitionVar, transitionStyles.transition);
      },
      [
        props.applyCSSVariables?.element,
        props.applyCSSVariables?.heightVar,
        props.applyCSSVariables?.widthVar,
        props.applyCSSVariables?.transitionVar,
      ],
    );

    /**
     * Create the resize stream and start observing.
     */
    const setupResizeObservable = useCallback(async (): Promise<[Subscription, DestroyWatchResizeObservable]> => {
      /*
        Under the hood, `watchResize` is creating a nested browsing
        context inside a DOM `<object>`. This nested context has a
        `window` object that provides the stream of "resize" events.
       */
      const [resize$, destroyResize$] = await watchResize(contentElement.current!);
      const subscription = resize$.subscribe(payload => {
        isTransitioning.current = true;
        setTimeout(() => {
          if (isMounted.current) isTransitioning.current = false;
        }, cssTimeToMilliseconds((props.transition as TransitionConfig)?.duration) + 100);

        const rect = payload.element.getBoundingClientRect();
        props.onResize!({ ...payload, transitionStyles: buildTransitionStyles(rect.height, rect.width) });
        applyCSSVariables(rect.height, rect.width);
        if (!props.observerOnly) setContainerElementDimensions(rect);
      });
      return [subscription, destroyResize$];
    }, [setContainerElementDimensions, props.observerOnly, buildTransitionStyles, applyCSSVariables, props.transition]);

    /**
     * Stop observing the resize stream and destroy the subscription (the stream
     * itself will be garbage collected).
     */
    const teardownResizeObservable = useCallback((subscription, destroy) => {
      if (subscription) subscription.unsubscribe();
      if (destroy) destroy();
    }, []);

    // --- React lifecycle

    // Setup/teardown the resize observable on component mount/unmount
    useEffect(() => {
      let teardownArgs: [Subscription, DestroyWatchResizeObservable];
      let timeout: any;
      isMounted.current = true;

      (async () => {
        if (props.initialDelay) {
          timeout = setTimeout(async () => {
            if (!props.observerOnly) setContainerElementDimensions();
            teardownArgs = await setupResizeObservable();
          }, props.initialDelay);
        } else {
          setContainerElementDimensions();
          teardownArgs = await setupResizeObservable();
        }
      })();

      return () => {
        isMounted.current = false;
        if (timeout) clearTimeout(timeout);
        if (teardownArgs) teardownResizeObservable(...teardownArgs);
      };
    }, []);

    useEffect(() => {
      if (isTransitioning.current && props.whileTransitioning) {
        const tick = () => {
          raf.current = requestAnimationFrame((...args) => {
            props.whileTransitioning!(...args);
            if (isTransitioning.current) tick();
          });
        };

        tick();
      } else {
        return () => {
          if (raf.current) cancelAnimationFrame(raf.current);
        };
      }

      return undefined;
    });

    // --- Rendering

    const otherProps = omit(props, [
      'children',
      'style',
      'initialDelay',
      'transition',
      'onResize',
      'observerOnly',
      'applyCSSVariables',
      'whileTransitioning',
      'autoWidth',
      'autoHeight',
    ]);

    return props.observerOnly ? (
      <div style={props.style} {...otherProps} ref={composeRefs<any>(contentElement, externalRef)}>
        {props.children}
      </div>
    ) : (
      <div
        style={{
          position: 'relative',
          ...props.style,
          ...buildTransitionStyles(),
        }}
        {...otherProps}
      >
        <div
          ref={composeRefs<any>(contentElement, externalRef)}
          style={{ position: width === 'auto' ? undefined : 'absolute' }}
        >
          {props.children}
        </div>
      </div>
    );
  },
);

FlexibleDiv.displayName = 'FlexibleDiv';

FlexibleDiv.defaultProps = {
  initialDelay: 0,
  transition: true,
  applyCSSVariables: {},
  onResize: () => {},
  style: {},
  observerOnly: false,
  autoWidth: false,
  autoHeight: false,
};
