import { get } from '~/app/libs/lodash-utils';

const object = { a: [{ b: { c: 3 } }] };

describe('get', () => {
  it('should get a property from a string', () => {
    expect(get(object, 'a[0].b.c')).toEqual(3);
  });

  it('should get a property from an array', () => {
    expect(get(object, ['a', '0', 'b', 'c'])).toEqual(3);
  });

  it('should get a property from mixed string and array', () => {
    expect(get(object, 'a.b.c', 'default')).toEqual('default');
  });
});
