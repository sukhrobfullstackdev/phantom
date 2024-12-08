import React, { useCallback, useState, createContext, useContext, useRef, useLayoutEffect } from 'react';
import { AnimatePresence, motion, AnimationProps, MotionAdvancedProps } from 'framer-motion';
import { createFramerTransition } from '@magiclabs/ui';
import { ensureArray } from '~/shared/libs/array-helpers';
import { trackPage } from '~/app/libs/analytics';
import { isEmpty } from '~/app/libs/lodash-utils';

interface ControllerContext<TPageID extends string = string> {
  navigateTo: (pageName: TPageID | null, eventData?: any) => void;
  isPageActive: (pages: TPageID | TPageID[]) => boolean;
  routes: PageItem<TPageID>[];
  navigateBackToPrevPage: () => void;
  resetToDefaultPage: () => void;
  getCurrentPageId: () => TPageID;
}

const ControllerContext = createContext({
  navigateBackToPrevPage: () => {},
  navigateTo: () => {},
  isPageActive: () => false,
  routes: [],
  resetToDefaultPage: () => {},
  getCurrentPageId: () => {},
} as ControllerContext<any>);

/**
 * Context from a controller component can be shared to components nested within
 * the rendered `page`. This enables child components to initiate navigation,
 * check the active page, and use the registered routes.
 */
export function useControllerContext<TPageID extends string = string>() {
  return useContext<ControllerContext<TPageID>>(ControllerContext);
}

interface PageItem<TPageID extends string> {
  id: TPageID;
  content: JSX.Element;
}

interface PageResolver<TPageID extends string = string> {
  (): TPageID | undefined | null | void;
}

const defaultPageTransition = createFramerTransition<{ rtl?: boolean }>()
  .withVariants({
    initial: () => ({
      y: 40,
      opacity: 0,
    }),

    animate: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', velocity: 20, stiffness: 300, damping: 20 },
    },

    exit: () => ({
      y: 40,
      opacity: 0,
      transition: { ease: 'easeIn', duration: 0.15 },
    }),
  })
  .withReducedMotion({
    initial: { opacity: 0, x: 0 },
    exit: { opacity: 0, x: 0 },
  });

export const useDefaultPageTransition = () => {
  return defaultPageTransition.use({
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  });
};

/**
 * Enables intra-component navigation state. Compare to how React Router works
 * at the global level. Instead of using the Window location, internal component
 * state defines which "page" is rendered. Automatic left/right sliding
 * transitions will occur between active pages (if desired).
 */
export function useController<TPageID extends string = string>(
  routes: PageItem<TPageID>[],
  options: {
    initialPage?: TPageID;
    defaultPage?: TPageID;
    shouldAnimate?: boolean;
    getAnimationProps?: (custom?: { rtl: boolean } | undefined) => AnimationProps & MotionAdvancedProps;
    autoFocusPage?: boolean;
    resolvers?: PageResolver<TPageID> | PageResolver<TPageID>[];
  } = {},
) {
  const {
    initialPage = routes[0]?.id,
    defaultPage = routes[0]?.id,
    shouldAnimate = true,
    autoFocusPage = true,
    resolvers,
  } = options;

  const [page, setPage] = useState(routes.find(route => route.id === initialPage) ?? routes[0]);
  const [rtl, setRTL] = useState(true);
  const [prevPageId, setPrevPageId] = useState('' as TPageID);

  /**
   * We use a ref'd copy of hook state to ensure that static router
   * callbacks don't have to be updated after the initial render.
   */
  const stateRef = useRef<{ page: PageItem<TPageID>; routes: PageItem<TPageID>[] }>(null!);
  stateRef.current = { page, routes };

  /**
   * Navigates to the given page registered in the controller.
   */
  const navigateTo = useCallback((pageName: TPageID | undefined, eventData?: any) => {
    const prevIndex = stateRef.current.routes.findIndex(i => i.id === stateRef.current.page?.id);
    const nextIndex = stateRef.current.routes.findIndex(i => i.id === pageName);
    const nextPage = stateRef.current.routes[nextIndex];

    if (pageName) trackPage(pageName, eventData || {});

    if (prevIndex !== nextIndex) {
      setPage(nextPage);
      setPrevPageId(stateRef.current.routes[prevIndex].id);
      setRTL(nextIndex > prevIndex);
    }
  }, []);

  /**
   * Executes the route reducer, if the resulting page name is different from
   * the currently active page, navigation occurs.
   */
  const resolvePage = useCallback((...resolversArg: PageResolver<TPageID>[]) => {
    const nextPage = resolversArg.map(resolver => resolver()).find(item => !!item);
    if (nextPage && nextPage !== stateRef.current.page.id) navigateTo(nextPage);
  }, []);

  /**
   * Dump way to reset the flow
   */
  const resetToDefaultPage = useCallback(() => {
    navigateTo(defaultPage);
  }, [defaultPage]);

  /**
   * A quick shortcut to get previous page id for nav back to prev page
   * This would fall into a loop if it's been call consecutively
   */
  const navigateBackToPrevPage = useCallback(() => {
    if (isEmpty(prevPageId)) {
      resetToDefaultPage();
    } else {
      navigateTo(prevPageId);
    }
  }, [prevPageId]);

  /**
   * Helpful factory for creating route reducer functions with strong typing.
   */
  const createPageResolver = useCallback((resolver: PageResolver<TPageID>) => resolver, []);

  /**
   * A callback returning `boolean` to indicate whether any page name given in
   * `pages` is the currently active page. This is analagous to React Router's
   * `matchPath`, for example.
   */
  const isPageActive = useCallback((pages: TPageID | TPageID[]) => {
    return !!ensureArray(pages).find(p => p === stateRef.current.page.id);
  }, []);

  const getCurrentPageId = useCallback(() => stateRef.current.page.id, []);

  const slideAnimation = useDefaultPageTransition();
  const getAnimationProps = options.getAnimationProps ?? slideAnimation;
  const animationProps = getAnimationProps({ rtl });
  const context = { navigateTo, isPageActive, routes, navigateBackToPrevPage, resetToDefaultPage, getCurrentPageId };

  const pageRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (autoFocusPage && pageRef.current) {
      pageRef.current.focus();
    }
  }, [pageRef, page.id]);

  // If a `resolvers` argument is given to the hook options, we'll implicitly
  // execute `resolvePage` to reduce boilerplate.
  if (resolvers) {
    resolvePage(...ensureArray(resolvers));
  }

  const content = routes.find(p => p.id === page.id)?.content;

  return {
    resolvePage,
    createPageResolver,
    navigateTo,
    isPageActive,
    routes,
    navigateBackToPrevPage,
    resetToDefaultPage,
    getCurrentPageId,

    page: shouldAnimate ? (
      <ControllerContext.Provider value={context as any}>
        <AnimatePresence exitBeforeEnter initial={false} custom={animationProps.custom}>
          <motion.div key={page.id} {...animationProps} ref={pageRef}>
            {content}
          </motion.div>
        </AnimatePresence>
      </ControllerContext.Provider>
    ) : (
      <ControllerContext.Provider value={context as any}>
        <div key={page.id} ref={pageRef}>
          {content}
        </div>
      </ControllerContext.Provider>
    ),
  };
}

export const createRoutes = <TPageID extends string = string>(routes: PageItem<TPageID>[]) => {
  /**
   * Helpful factory for creating route reducer functions with strong typing.
   */
  const createPageResolver = useCallback((resolver: PageResolver<TPageID>) => resolver, []);

  return { routes, createPageResolver };
};
