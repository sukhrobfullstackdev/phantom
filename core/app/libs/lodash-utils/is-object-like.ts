// Checks if value is object-like (objects, arrays, functions, etc.)

export default function isObjectLike(val: any): boolean {
  return val != null && typeof val === 'object';
}
