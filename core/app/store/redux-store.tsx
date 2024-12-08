import React from 'react';
import { applyMiddleware, createStore as createReduxStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import { Provider as ReduxProvider, useSelector as useReduxSelector } from 'react-redux';
import { createPersistReducer, isPersistReducer, syncReduxPersist, waitForReduxPersistHydration } from './persistence';
import type { GetModelFromReducer, StoreWrapper } from './types';
import { isIframe } from '~/app/constants/is-iframe';

/**
 * A "no-op" reducer. Stores are initialized with
 * this reducer type, which contains no state.
 */
const noopReducer: Reducer<any, any> = state => ({ ...state });

/**
 * If the root reducer provided to `createStore` is not wrapped with a
 * `redux-persist` reducer, we provide a noop-wrapper here to ensure that
 * `await createStore(...).ready` will always resolve.
 */
function createNoopPersistedReducer<T extends Reducer<any, any>>(nonPersistedRootReducer: T) {
  return createPersistReducer('noop', nonPersistedRootReducer, {
    // Nothing gets persisted at the root-level of this reducer.
    // However, this won't block nested reducers from being persisted.
    shouldPersist: false,
  });
}

/**
 * Allows for asychronously-loaded reducers to be initialized with state before
 * the store is marked as "ready."
 */
function createInitializableReducer<T extends Reducer<any, any>>(reducer: T) {
  return ((state, action) => {
    if (action.type === '__initialize__') {
      // Given an undefined state parameter, the reducer will hydrate with
      // initial state instead, thus initializing async stores.
      return reducer(undefined, action);
    }

    return reducer(state, action);
  }) as T;
}

/**
 * Type-guard that returns `true` if the given `value` is a reducer factory,
 * rather than a plain-old reducer itself.
 */
function isReducerFactory<T extends Reducer<any, any>>(value: T | (() => Promise<T>)): value is () => Promise<T> {
  return value.length === 0;
}

/**
 * Configures a Redux store and `WebStorage` persistor for managing global state
 * across the application (or an individual feature).
 */

export function createStore<T extends Reducer<any, any>>(rootReducer: T | (() => Promise<T>), name: string) {
  const newName = `${isIframe ? 'iframe' : 'root'} ${name}`;
  const composeEnhancers = composeWithDevTools({ name: newName });
  const store: StoreWrapper<T> = createReduxStore(noopReducer, {}, composeEnhancers(applyMiddleware(thunk)));

  //
  // Order of operations here:
  //
  //   1. Create a "persistor" using `redux-persist`.
  //
  //   2. Get the root reducer derived from a `rootReducer` argument. This can
  //      be a factory that returns a reducer, or a reducer itself.
  //
  //   3. Initialize the created Redux store with the reducer from step 2. This
  //      happens asynchronously, so consumers of this store should wait for the
  //      `ready` promise to resolve before dispatching actions.
  //
  //   4. The `ready` promise is created, resolving after the store has been
  //      initialized with its proper root reducer and once `redux-persist` has
  //      completely hydrated.
  //

  const persistor = persistStore(store, { manualPersist: true } as any);
  const syncPersistor = async () => {
    await persistor.flush();
    await syncReduxPersist(store);
  };

  const reducersLoaded = isReducerFactory(rootReducer) ? Promise.resolve(rootReducer()) : Promise.resolve(rootReducer);
  const ready: Promise<boolean> = reducersLoaded
    .then(r => {
      const definitelyPersistReducer = isPersistReducer(r) ? r : createNoopPersistedReducer(r);
      const initializableRootReducer = createInitializableReducer(definitelyPersistReducer);
      store.replaceReducer(initializableRootReducer);
      store.dispatch({ type: '__initialize__' } as any);
      persistor.persist();
    })
    .then(() => waitForReduxPersistHydration(persistor));

  /**
   * For convenience, we expose React hooks for this store, equivalent to
   * `useSelector` and `useDispatch` from `react-redux`. However, here they are
   * wrapped in strong typings for the relevant store.
   */
  const hooks = {
    useSelector<TSelected = any>(
      selector: (state: GetModelFromReducer<T>) => TSelected,
      equalityFn?: (left: ReturnType<typeof selector>, right: ReturnType<typeof selector>) => boolean,
    ): ReturnType<typeof selector> {
      const state = useReduxSelector(() => selector(store.getState()), equalityFn);
      return state;
    },

    useDispatch() {
      return store.dispatch;
    },
  };

  /**
   * A simple lazy component (paired with `React.Suspense`) which defers
   * rendering until the redux store being provided is ready (and persistence
   * has been hydrated).
   */
  const LazyReduxProvider = React.lazy(async () => {
    await ready;

    const component: React.FC<{ store: typeof store; children?: React.ReactNode }> = p => {
      return <ReduxProvider store={p.store}>{p.children}</ReduxProvider>;
    };

    // We aren't actually importing a component, so we need to wrap it in a
    // "fake" default export.
    return { default: component };
  });

  /**
   * A `React.Suspense` implementation to achieve the `LazyReduxProvider`
   * functionality described above.
   */
  const Provider: React.FC<{ loading?: React.ReactNode; children?: React.ReactNode }> = props => {
    const { children, loading = null } = props;

    return (
      <React.Suspense fallback={loading}>
        <LazyReduxProvider store={store}>{children}</LazyReduxProvider>
      </React.Suspense>
    );
  };

  // Put it all together with strong TypeScript typings.
  return Object.assign(store, { ready, syncPersistor, hooks, Provider });
}
