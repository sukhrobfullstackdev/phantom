import { isObjectLike } from '~/app/libs/lodash-utils';

describe('isObjectLike', () => {
  it('should return true if the value is object-like', () => {
    expect(isObjectLike({})).toBeTruthy();
    expect(isObjectLike([])).toBeTruthy();
    expect(isObjectLike(() => {})).toBeFalsy();
    expect(isObjectLike(new Date())).toBeTruthy();
  });

  it('should return false if the value is not object-like', () => {
    expect(isObjectLike('string')).toBeFalsy();
    expect(isObjectLike(123)).toBeFalsy();
    expect(isObjectLike(null)).toBeFalsy();
    expect(isObjectLike(undefined)).toBeFalsy();
    expect(isObjectLike(Symbol('symbol'))).toBeFalsy();
  });
});
