import { arrayPush } from '~/app/libs/lodash-utils';

describe('arrayPush', () => {
  it('should append elements of values to array', () => {
    expect(arrayPush([1, 2], [3, 4])).toEqual([1, 2, 3, 4]);
  });
});
