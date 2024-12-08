import { isEmpty } from '~/app/libs/lodash-utils';

describe('isEmpty', () => {
  test('should return true for null', () => {
    expect(isEmpty(null)).toBe(true);
  });

  test('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  test('should return true for an empty string', () => {
    expect(isEmpty('')).toBe(true);
  });

  test('should return true for an empty array', () => {
    expect(isEmpty([])).toBe(true);
  });

  test('should return true for an empty object', () => {
    expect(isEmpty({})).toBe(true);
  });

  test('should return true for an empty Map', () => {
    expect(isEmpty(new Map())).toBe(true);
  });

  test('should return true for an empty Set', () => {
    expect(isEmpty(new Set())).toBe(true);
  });

  test('should return false for a non-empty string', () => {
    expect(isEmpty('text')).toBe(false);
  });

  test('should return false for a non-empty array', () => {
    expect(isEmpty([1, 2])).toBe(false);
  });

  test('should return false for a non-empty object', () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });

  test('should return false for a non-empty Map', () => {
    expect(isEmpty(new Map().set('a', 1))).toBe(false);
  });

  test('should return false for a non-empty Set', () => {
    expect(isEmpty(new Set().add('a'))).toBe(false);
  });
});
