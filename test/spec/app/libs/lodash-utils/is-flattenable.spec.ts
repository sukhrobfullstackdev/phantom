import { isFlattenable } from '~/app/libs/lodash-utils';

describe('isFlattenable', () => {
  it('should return true if value is an array or arguments object', () => {
    function test() {
      // eslint-disable-next-line prefer-rest-params
      expect(isFlattenable(arguments)).toBe(true);
    }
    test();
    expect(isFlattenable([1, 2, 3])).toBe(true);
  });
  it('should return false if value is neither an array nor arguments object', () => {
    expect(isFlattenable('not flattenable')).toBe(false);
  });
});
