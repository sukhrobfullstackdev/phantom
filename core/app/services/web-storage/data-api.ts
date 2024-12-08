import localforage from 'localforage';
import * as memoryDriver from 'localforage-driver-memory';
import type { WebStorageModel } from './model';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';

/**
 * An overload of the `LocalForage` data API
 * including a strongly-typed data model.
 */
export interface WebStorageDataAPI {
  getItem<T extends keyof WebStorageModel>(key: T): Promise<WebStorageModel[T] | null>;
  setItem<T extends keyof WebStorageModel>(key: T, value: WebStorageModel[T]): Promise<WebStorageModel[T] | null>;
  removeItem(key: keyof WebStorageModel): Promise<void>;
  clear(): Promise<void>;
  length(): Promise<number>;
  key(keyIndex: number): Promise<keyof WebStorageModel>;
  keys(): Promise<keyof WebStorageModel[]>;
  iterate<T>(
    iteratee: (value: WebStorageModel[keyof WebStorageModel], key: keyof WebStorageModel, iterationNumber: number) => T,
  ): Promise<T>;
}

let lf: LocalForage;

/**
 * Creates a function which wraps the underlying `LocalForage` function
 * specified by `method`. Before data is accessed, the `LocalForage` instance is
 * lazily initialized.
 */
function proxyLocalForageMethod<TMethod extends keyof WebStorageDataAPI>(method: TMethod): WebStorageDataAPI[TMethod] {
  return async (...args: any[]) => {
    try {
      if (!lf) {
        lf = localforage.createInstance({ name: 'magic_auth' });
        await lf.defineDriver(memoryDriver);
        const drivers = [localforage.INDEXEDDB, localforage.LOCALSTORAGE, memoryDriver._driver];

        // Indexed DB in Flutter iOS Webview have long pending open calls. Use local storage instead.
        // For more detail, please check SC48460
        const options = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
        if (options.sdk === 'magic-sdk-flutter') {
          drivers.shift();
        }

        await lf.setDriver(drivers);
      }

      await lf.ready();
      return (await (lf[method] as any).apply(lf, args)) ?? null;
    } catch {
      return null;
    }
  };
}

export const data: WebStorageDataAPI = {
  getItem: proxyLocalForageMethod('getItem'),
  setItem: proxyLocalForageMethod('setItem'),
  removeItem: proxyLocalForageMethod('removeItem'),
  clear: proxyLocalForageMethod('clear'),
  length: proxyLocalForageMethod('length'),
  key: proxyLocalForageMethod('key'),
  keys: proxyLocalForageMethod('keys'),
  iterate: proxyLocalForageMethod('iterate'),
};
