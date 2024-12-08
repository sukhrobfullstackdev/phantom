import { flatten } from '~/app/libs/lodash-utils';

describe('flatten', () => {
  it('should flatten array a single level deep', () => {
    expect(flatten([1, [2, [3, [4]], 5]])).toEqual([1, 2, [3, [4]], 5]);
  });
  it('should return an empty array if input is null or undefined', () => {
    expect(flatten(null)).toEqual([]);
    expect(flatten(undefined)).toEqual([]);
  });
});
