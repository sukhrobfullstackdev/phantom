type Func<T extends any[], R> = (...args: T) => R;
type Resolver<T extends any[], C> = (this: C, ...args: T) => any;

interface Cache {
  clear(): void;
  delete(key: any): boolean;
  get(key: any): any;
  has(key: any): boolean;
  set(key: any, value: any): this;
}

function memoize<T extends any[], R, C = unknown>(func: Func<T, R>, resolver?: Resolver<T, C>): Func<T, R> {
  if (typeof func !== 'function' || (resolver != null && typeof resolver !== 'function')) {
    throw new TypeError('Expected a function');
  }

  const memoized = function (this: C, ...args: T): R {
    const key = resolver ? resolver.apply(this, args) : args[0];
    const { cache } = memoized;

    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  } as Func<T, R> & { cache: Cache };

  memoized.cache = new (memoize.Cache || Map)();
  return memoized;
}

memoize.Cache = Map as { new (): Cache };

export default memoize;
