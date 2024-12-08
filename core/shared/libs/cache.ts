import { isEmpty } from '~/app/libs/lodash-utils';

interface TimedCache {
  get<T>(key: any, getter: () => Promise<T>, cacheLifespan?: number): Promise<T>;
  clear(...keys: string[]): void;
  clearByRegex(regex: RegExp): void;
}

export function createCache(): TimedCache {
  const cache = new Map<any, { value: any; timestamp: number; lifespan: number }>();

  return {
    async get(key, getter, cacheLifespan = 5000) {
      if (cache.has(key)) {
        const { value, timestamp, lifespan } = cache.get(key)!;
        if (Date.now() - timestamp <= lifespan) return value;
        cache.delete(key);
      }

      const value = await getter();
      cache.set(key, {
        value,
        timestamp: Date.now(),
        lifespan: cacheLifespan,
      });

      return value;
    },

    clear(...keys) {
      if (isEmpty(keys)) return cache.clear();
      return keys.forEach(key => cache.delete(key));
    },

    /**
     * Clears keys via regex matching.
     */
    clearByRegex(regex: RegExp) {
      if (!regex) return;
      [...cache.keys()].filter(key => regex.exec(key)).forEach(key => cache.delete(key));
    },
  };
}

export const globalCache = createCache();
