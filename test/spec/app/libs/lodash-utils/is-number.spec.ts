import { isNumber } from '~/app/libs/lodash-utils';

describe('isNumber', () => {
  it('should return true for integers', () => {
    expect(isNumber(3)).toBe(true);
  });

  it('should return true for Number.MIN_VALUE', () => {
    expect(isNumber(Number.MIN_VALUE)).toBe(true);
  });

  it('should return true for Infinity', () => {
    expect(isNumber(Infinity)).toBe(true);
  });

  it('should return false for numeric strings', () => {
    expect(isNumber('3')).toBe(false);
  });

  it('should return false for NaN', () => {
    // NaN is of type number - https://stackoverflow.com/questions/2801601/why-does-typeof-nan-return-number
    expect(isNumber(NaN)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isNumber(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isNumber(undefined)).toBe(false);
  });

  it('should return false for objects', () => {
    expect(isNumber({})).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isNumber([])).toBe(false);
  });

  it('should return false for functions', () => {
    expect(isNumber(() => {})).toBe(false);
  });
});
