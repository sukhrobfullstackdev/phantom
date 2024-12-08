import { isUndefined } from '~/app/libs/lodash-utils';

describe('isUndefined', () => {
  it('should return true when the value is undefined', () => {
    expect(isUndefined(undefined)).toBe(true);
  });

  it('should return false when the value is null', () => {
    expect(isUndefined(null)).toBe(false);
  });

  it('should return false for any non-undefined value', () => {
    expect(isUndefined(0)).toBe(false);
    expect(isUndefined('')).toBe(false);
    expect(isUndefined(false)).toBe(false);
    expect(isUndefined([])).toBe(false);
    expect(isUndefined({})).toBe(false);
  });
});
