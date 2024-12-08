import { isString, isUndefined, isEmpty } from '~/app/libs/lodash-utils';

/**
 * Stringify some data or object to a human-readable format.
 */
export function semanticStringify(data?: any) {
  let result = '';

  if (isUndefined(data)) result = 'undefined';
  else if (data === null) result = 'null';
  else if (Number.isNaN(data)) result = 'NaN';
  else if (isString(data) && isEmpty(data)) result = '<empty string>';
  else if (typeof data === 'function') result = data.toString();
  else result = JSON.stringify(data, null, 2);

  return result;
}
