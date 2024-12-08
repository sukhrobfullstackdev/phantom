import { isNil } from '~/app/libs/lodash-utils';

describe('isNil', () => {
  it('returns true for null and undefined values', () => {
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
  });

  it('returns false for other values', () => {
    expect(isNil(0)).toBe(false);
    expect(isNil(false)).toBe(false);
    expect(isNil('')).toBe(false);
    expect(isNil({})).toBe(false);
    expect(isNil([])).toBe(false);
  });
});
