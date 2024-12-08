import { isEqual } from '~/app/libs/lodash-utils';

describe('isEqual function', () => {
  it('should return true for equal numbers', () => {
    expect(isEqual(42, 42)).toBe(true);
  });

  it('should return false for unequal numbers', () => {
    expect(isEqual(42, 43)).toBe(false);
  });

  it('should return true for equal strings', () => {
    expect(isEqual('test', 'test')).toBe(true);
  });

  it('should return false for unequal strings', () => {
    expect(isEqual('test', 'different')).toBe(false);
  });

  it('should return true for equal arrays', () => {
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('should return false for unequal arrays', () => {
    expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it('should return true for deeply equal objects', () => {
    expect(isEqual({ a: 1, b: { c: 3 } }, { a: 1, b: { c: 3 } })).toBe(true);
  });

  it('should return false for unequal objects', () => {
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
  });

  it('should return true for complex equality', () => {
    expect(isEqual({ a: [1, 2], b: { c: 3 } }, { a: [1, 2], b: { c: 3 } })).toBe(true);
  });

  it('should return false for complex inequality', () => {
    expect(isEqual({ a: [1, 2], b: { c: 3 } }, { a: [1, 3], b: { c: 3 } })).toBe(false);
  });

  it('should handle the theme[key] case', () => {
    expect(
      isEqual('https://assets.fortmatic.com/MagicLogos/blank.png', 'https://assets.fortmatic.com/MagicLogos/blank.png'),
    ).toBe(true);
  });
});
