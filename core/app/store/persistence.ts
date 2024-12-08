import { Reducer, Store } from 'redux';
import {
  persistReducer,
  PersistConfig,
  WebStorage as ReduxPersistWebStorage,
  REHYDRATE,
  Persistor,
} from 'redux-persist';
import { merge } from '~/app/libs/lodash-utils';
import { WebStorageDataAPI, WebStorageService } from '../services/web-storage';
import type { GetModelFromReducer, GetActionTypesFromReducer } from './types';

type PersistReducerReservedKeys =
  | 'storage'
  | 'key'
  | 'keyPrefix'
  | 'throttle'
  | 'getStoredState'
  | 'serialize'
  | 'timeout';

type NarrowedPersistReducerConfig<T extends Reducer<any, any>> = Omit<
  Partial<PersistConfig<GetModelFromReducer<T>>>,
  PersistReducerReservedKeys
>;

interface PersistReducerOptions<T extends Reducer<any, any>> extends NarrowedPersistReducerConfig<T> {
  /**
   * While `true`  -- Enable persistance, `redux-persist` will proceed normally.
   * While `false` -- Disable persistance, caching operations will be short-circuited.
   */
  shouldPersist?: boolean;
}

const noopStorage: ReduxPersistWebStorage = {
  getItem: (async () => {}) as any,
  setItem: (async () => {}) as any,
  removeItem: (async () => {}) as any,
};

/**
 * When we create a persisted reducer, we have to register the namespace and
 * options so we can enable cross-tab sync once the store is instantiated.
 */
const crosstabSyncRegistry: Map<
  string,
  { whitelist?: string[]; blacklist?: string[]; storage: WebStorageDataAPI | ReduxPersistWebStorage }
> = new Map();

const persistReducerSymbol = Symbol(
  "If this symbol is present on a reducer function, that means we've already processed it with `redux-persist`!",
);

/**
 * Create a Redux reducer that has certain keys persisted to WebStorage. This is
 * our own abstraction on top of `redux-persist`.
 */
export function createPersistReducer<T extends Reducer<any, any>>(
  namespace: string,
  reducer: T,
  options: PersistReducerOptions<T> = {},
) {
  const { shouldPersist = true } = options;
  const optionsResolved = merge({}, options, {
    storage: shouldPersist ? WebStorageService.data : noopStorage,
    key: namespace,
  });

  const result = persistReducer<GetModelFromReducer<T>, GetActionTypesFromReducer<T>>(optionsResolved, reducer);
  result[persistReducerSymbol] = true;

  if (shouldPersist) {
    crosstabSyncRegistry.set(namespace, {
      whitelist: optionsResolved.whitelist,
      blacklist: optionsResolved.blacklist,
      storage: optionsResolved.storage,
    });
  }

  return result;
}

/**
 * Returns `true` if the given argument is a reducer function that was generated
 * using `createPersistReducer`.
 */
export function isPersistReducer<T extends Reducer<any, any>>(reducer: T) {
  return !!reducer[persistReducerSymbol];
}

/**
 * Sync `redux-persist` items across tabs. We invoke this before each JSON RPC
 * payload is handled.
 */
export async function syncReduxPersist(store: Store) {
  const namespaces = [...crosstabSyncRegistry.keys()];

  await Promise.all(
    namespaces.map(async namespace => {
      const { whitelist = [], blacklist = [], storage } = crosstabSyncRegistry.get(namespace)!;

      try {
        const serializedStatePartial = await storage.getItem(`persist:${namespace}`);
        const statePartial: Record<string, any> = JSON.parse(serializedStatePartial ?? '{}');

        /* eslint-disable-next-line no-shadow */
        const state: Record<string, any> = Object.keys(statePartial).reduce((state, reducerKey) => {
          if (whitelist && !whitelist.includes(reducerKey)) return state;
          if (blacklist && blacklist.includes(reducerKey)) return state;

          try {
            /* eslint-disable-next-line no-param-reassign */
            state[reducerKey] = JSON.parse(statePartial[reducerKey]);
            return state;
          } catch {}

          return state;
        }, {});

        store.dispatch({
          key: namespace,
          payload: state,
          type: REHYDRATE,
        });
      } catch {}
    }),
  );
}

/**
 * Returns a promise that resolves when `redux-persist`
 * has initially hyrated the store.
 */
export function waitForReduxPersistHydration(persistor: Persistor): Promise<boolean> {
  return new Promise(resolve => {
    const handlePersistorState = () => {
      if (persistor.getState().bootstrapped) {
        unsubscribe();
        resolve(true);
      }
    };

    const unsubscribe = persistor.subscribe(handlePersistorState);
    handlePersistorState();
  });
}
