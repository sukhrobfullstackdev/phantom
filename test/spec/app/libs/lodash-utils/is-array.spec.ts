import { isArray } from '~/app/libs/lodash-utils';

describe('isArray', () => {
  it('should return true if value is an array', () => {
    expect(isArray([1, 2, 3])).toBe(true);
  });
  it('should return false if value is not an array', () => {
    expect(isArray('not an array')).toBe(false);
  });
});
