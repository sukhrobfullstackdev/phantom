import { baseGetTag } from '~/app/libs/lodash-utils';

describe('baseGetTag', () => {
  it('should return the correct toStringTag for different values', () => {
    expect(baseGetTag('string')).toBe('[object String]');
    expect(baseGetTag(123)).toBe('[object Number]');
    expect(baseGetTag([])).toBe('[object Array]');
    expect(baseGetTag({})).toBe('[object Object]');
    expect(baseGetTag(() => {})).toBe('[object Function]');
    expect(baseGetTag(null)).toBe('[object Null]');
    expect(baseGetTag(undefined)).toBe('[object Undefined]');
    expect(baseGetTag(Symbol('symbol'))).toBe('[object Symbol]');
  });
});
