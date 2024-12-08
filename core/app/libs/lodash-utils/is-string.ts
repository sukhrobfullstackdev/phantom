import { isArray, isObjectLike, baseGetTag } from '~/app/libs/lodash-utils';

export default function isString(value: any): boolean {
  const stringTag = '[object String]';

  return typeof value === 'string' || (!isArray(value) && isObjectLike(value) && baseGetTag(value) === stringTag);
}
