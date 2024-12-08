import { baseFlatten } from '~/app/libs/lodash-utils';

describe('baseFlatten', () => {
  it('should return a flattened array based on given depth', () => {
    expect(baseFlatten([1, [2, [3, [4]], 5]], 2)).toEqual([1, 2, 3, [4], 5]);
  });
});
