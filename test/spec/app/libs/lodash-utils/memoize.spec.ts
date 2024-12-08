import { memoize } from '~/app/libs/lodash-utils';

describe('memoize', () => {
  it('should return the cached result on subsequent calls with the same argument', () => {
    const add = (a: number, b: number) => a + b;
    const memoizedAdd = memoize(add);

    expect(memoizedAdd(1, 2)).toBe(3);
    expect(memoizedAdd(1, 2)).toBe(3);
    // @ts-ignore
    expect(memoizedAdd.cache.get(1)).toBe(3);
  });

  it('should return different results for different arguments', () => {
    const add = (a: number, b: number) => a + b;
    const memoizedAdd = memoize(add);

    expect(memoizedAdd(1, 2)).toBe(3);
    expect(memoizedAdd(2, 3)).toBe(5);
    // @ts-ignore
    expect(memoizedAdd.cache.get(1)).toBe(3);
    // @ts-ignore
    expect(memoizedAdd.cache.get(2)).toBe(5);
  });

  it('should use resolver to compute cache key', () => {
    const multiply = (a: number, b: number) => a * b;
    const resolver = (a: number, b: number) => `${a}-${b}`;
    const memoizedMultiply = memoize(multiply, resolver);

    expect(memoizedMultiply(2, 3)).toBe(6);
    // @ts-ignore
    expect(memoizedMultiply.cache.get('2-3')).toBe(6);
  });

  it('should throw a TypeError if the first argument is not a function', () => {
    // @ts-ignore
    expect(() => memoize('not a function')).toThrow(TypeError);
  });

  it('should throw a TypeError if the second argument is provided and is not a function', () => {
    // @ts-ignore
    expect(() => memoize(() => {}, 'not a function')).toThrow(TypeError);
  });
});
