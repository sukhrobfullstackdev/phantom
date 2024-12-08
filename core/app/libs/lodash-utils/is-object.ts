export default function isObject(value: unknown): boolean {
  return value != null && (typeof value === 'object' || typeof value === 'function');
}
