import { isObject } from '~/app/libs/lodash-utils';

describe('isObject', () => {
  it('should return true for an object', () => {
    expect(isObject({})).toBe(true);
  });

  it('should return true for an array', () => {
    expect(isObject([1, 2, 3])).toBe(true);
  });

  it('should return true for a function', () => {
    expect(isObject(() => {})).toBe(true);
  });

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isObject(undefined)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isObject('string')).toBe(false);
  });

  it('should return false for a number', () => {
    expect(isObject(42)).toBe(false);
  });

  it('should return false for a boolean', () => {
    expect(isObject(true)).toBe(false);
  });
});
