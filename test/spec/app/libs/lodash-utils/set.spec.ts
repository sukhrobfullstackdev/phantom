import { set } from '~/app/libs/lodash-utils';

describe('set', () => {
  it('should set property on an object', () => {
    const object = { a: [{ b: { c: 3 } }] };
    set(object, 'a[0].b.c', 4);

    expect(object.a[0].b.c).toEqual(4);
  });

  it('should set property on an object array', () => {
    const object = { a: [{ b: { c: 3 } }] };
    set(object, ['x', '0', 'y', 'z'], 5);
    // @ts-ignore for testing purposes
    expect(object.x[0].y.z).toEqual(5);
  });
});
