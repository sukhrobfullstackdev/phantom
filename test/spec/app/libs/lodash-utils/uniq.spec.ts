import { uniq } from '~/app/libs/lodash-utils';

describe('uniq', () => {
  it('should remove duplicate numbers', () => {
    expect(uniq([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it('should remove duplicate strings', () => {
    expect(uniq(['a', 'b', 'b', 'c', 'c', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('should return an empty array when given an empty array', () => {
    expect(uniq([])).toEqual([]);
  });

  it('should handle an array of mixed types', () => {
    expect(uniq([1, 'a', 1, 'a', 2, 'b'])).toEqual([1, 'a', 2, 'b']);
  });
});
