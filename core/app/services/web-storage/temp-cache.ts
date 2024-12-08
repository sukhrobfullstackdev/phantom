import { getLogger } from '~/app/libs/datadog';
import { data } from './data-api';

export const getStorageCache = async <T>(key: string): Promise<T | null> => {
  const cache: string = await data.getItem(key);
  let cachedData: T | null = null;

  if (cache) {
    try {
      cachedData = JSON.parse(cache);
    } catch (err: unknown) {
      cachedData = null;
      getLogger().warn(`Issue parsing storage cache for ${key}`, err || {});
    } finally {
      data.removeItem(key);
    }
  }

  return cachedData;
};
