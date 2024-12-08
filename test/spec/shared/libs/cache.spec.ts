import { createCache } from '~/shared/libs/cache';

let globalCache;

beforeEach(() => {
  globalCache = createCache();
});

test('sets and clears keys', async () => {
  const testKey = 'singing in the rain';
  const expectedValue = {
    id: 'object id',
  };
  const setterSpy = jest.fn().mockResolvedValue(expectedValue);
  expect(await globalCache.get(testKey, setterSpy)).toBe(expectedValue);
  expect(await globalCache.get(testKey, setterSpy)).toBe(expectedValue);
  expect(setterSpy).toBeCalledTimes(1);
  globalCache.clear(testKey);
  expect(await globalCache.get(testKey, setterSpy)).toBe(expectedValue);
  expect(setterSpy).toBeCalledTimes(2);
});

test('sets and clears keys via regex', async () => {
  const testKey = 'singing in the rain';
  const expectedValue = {
    id: 'object id',
  };
  const setterSpy = jest.fn().mockResolvedValue(expectedValue);
  expect(await globalCache.get(testKey, setterSpy)).toBe(expectedValue);
  expect(await globalCache.get(testKey, setterSpy)).toBe(expectedValue);
  expect(setterSpy).toBeCalledTimes(1);
  globalCache.clearByRegex(/sing/);
  expect(await globalCache.get(testKey, setterSpy)).toBe(expectedValue);
  expect(setterSpy).toBeCalledTimes(2);
});
