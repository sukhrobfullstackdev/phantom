import { Maybe, Definitely } from '../types/utility-types';

/**
 * Cast `value` to array. Returns the original value if it is already an array.
 */
export function ensureArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value];
}

/**
 * Remove falsey values from the given array `value`.
 */
export function cleanArray<T extends Maybe<any>>(value: T[]): Definitely<T>[] {
  return value.filter(Boolean) as Definitely<T>[];
}
