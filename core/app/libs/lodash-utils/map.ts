type Collection<T> = T[] | Record<string, T>;

export default function map<T, R>(
  collection: Collection<T> | null | undefined,
  iteratee: (value: T, key: number | string, collection: Collection<T>) => R,
): R[] {
  if (collection === null || collection === undefined) {
    return [];
  }
  if (Array.isArray(collection)) {
    return collection.map((value, index) => iteratee(value, index, collection));
  }
  if (typeof collection === 'object') {
    return Object.keys(collection).map(key => iteratee(collection[key], key, collection));
  }
  return [];
}
