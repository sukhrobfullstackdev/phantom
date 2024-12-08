import { isString } from '~/app/libs/lodash-utils';

describe('isString', () => {
  it('should return true for string literals', () => {
    expect(isString('abc')).toBeTruthy();
  });

  it('should return true for String objects', () => {
    // eslint-disable-next-line no-new-wrappers
    expect(isString(new String('abc'))).toBeTruthy();
  });

  it('should return false for numbers', () => {
    expect(isString(1)).toBeFalsy();
  });

  it('should return false for arrays', () => {
    expect(isString(['abc'])).toBeFalsy();
  });

  it('should return false for objects', () => {
    expect(isString({ a: 'abc' })).toBeFalsy();
  });

  it('should return false for null', () => {
    expect(isString(null)).toBeFalsy();
  });

  it('should return false for undefined', () => {
    expect(isString(undefined)).toBeFalsy();
  });

  it('should return false for boolean values', () => {
    expect(isString(true)).toBeFalsy();
    expect(isString(false)).toBeFalsy();
  });

  it('should return false for functions', () => {
    expect(isString(() => 'abc')).toBeFalsy();
  });

  it('should return false for symbols', () => {
    expect(isString(Symbol('abc'))).toBeFalsy();
  });
});
