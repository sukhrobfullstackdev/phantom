import { has } from '~/app/libs/lodash-utils';

const object = { a: { b: 2 } };

describe('has', () => {
  it('should determine if object has property', () => {
    expect(has(object, 'a')).toEqual(true);
  });

  it('should determine if object has nested property', () => {
    expect(has(object, 'a.b')).toEqual(true);
  });

  it('should determine if object has array of properties', () => {
    expect(has(object, ['a', 'b'])).toEqual(true);
  });

  it('should determine if object does not have property', () => {
    expect(has(object, ['a', 'b', 'c'])).toEqual(false);
  });
});
