import { map } from '~/app/libs/lodash-utils';

describe('map', () => {
  it('should apply the function to each element in an array', () => {
    expect(map([1, 2, 3], x => x * 2)).toEqual([2, 4, 6]);
  });

  it('should apply the function to each value in an object', () => {
    expect(map({ a: 1, b: 2, c: 3 }, x => x * 2)).toEqual([2, 4, 6]);
  });

  it('should handle an empty array', () => {
    expect(map([], x => x * 2)).toEqual([]);
  });

  it('should handle an empty object', () => {
    // @ts-ignore
    expect(map({}, x => x * 2)).toEqual([]);
  });

  it('should pass the index as the second argument for arrays', () => {
    expect(map([10, 20, 30], (_, index) => index)).toEqual([0, 1, 2]);
  });

  it('should pass the key as the second argument for objects', () => {
    expect(map({ a: 10, b: 20, c: 30 }, (_, key) => key)).toEqual(['a', 'b', 'c']);
  });

  it('should return an empty array for non-array and non-object input', () => {
    // @ts-ignore
    expect(map(null, x => x)).toEqual([]);
    // @ts-ignore
    expect(map(123, x => x)).toEqual([]);
  });
});
