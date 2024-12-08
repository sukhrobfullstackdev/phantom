import { isArguments } from '~/app/libs/lodash-utils';

describe('isArguments', () => {
  it('should return true if value is an arguments object', () => {
    function test() {
      // eslint-disable-next-line prefer-rest-params
      expect(isArguments(arguments)).toBe(true);
    }
    test();
  });
  it('should return false if value is not an arguments object', () => {
    expect(isArguments([1, 2, 3])).toBe(false);
  });
});
