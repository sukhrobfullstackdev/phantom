import baseFlatten from './base-flatten';

/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
export default function flatten(array) {
  const length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, 1) : [];
}
