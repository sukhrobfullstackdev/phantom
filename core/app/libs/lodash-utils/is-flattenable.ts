import isArray from './is-array';
import isArguments from './is-arguments';

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
export default function isFlattenable(value) {
  return isArray(value) || isArguments(value);
}
