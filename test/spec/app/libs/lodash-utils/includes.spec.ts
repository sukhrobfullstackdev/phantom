import { includes } from '~/app/libs/lodash-utils';

describe('includes', () => {
  it('should return true if the array includes the specified value', () => {
    expect(includes([1, 2, 3], 2)).toBe(true);
  });

  it('should return false if the array does not include the specified value', () => {
    expect(includes([1, 2, 3], 4)).toBe(false);
  });

  it('should return true if the string includes the specified value', () => {
    expect(includes('hello', 'e')).toBe(true);
  });

  it('should return false if the string does not include the specified value', () => {
    expect(includes('hello', 'z')).toBe(false);
  });

  it('should start searching from the specified index in an array', () => {
    expect(includes([1, 2, 3], 1, 1)).toBe(false);
  });

  it('should start searching from the specified index in a string', () => {
    expect(includes('hello', 'h', 1)).toBe(false);
  });

  it('should handle an empty array', () => {
    expect(includes([], 1)).toBe(false);
  });

  it('should handle an empty string', () => {
    expect(includes('', 'a')).toBe(false);
  });
});
