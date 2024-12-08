export default function includes(collection: string | any[], value: any, fromIndex = 0): boolean {
  if (typeof collection === 'string') {
    return collection.includes(value, fromIndex);
  }
  if (Array.isArray(collection)) {
    return collection.slice(fromIndex).includes(value);
  }

  return false;
}
