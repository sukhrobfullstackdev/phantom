export default function find<T>(collection: T[], predicate: (item: T) => boolean): T | undefined {
  if (!collection || typeof predicate !== 'function') {
    return undefined;
  }

  for (let i = 0; i < collection.length; i++) {
    if (predicate(collection[i])) {
      return collection[i];
    }
  }

  return undefined;
}
