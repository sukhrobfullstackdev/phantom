import { omit } from '~/app/libs/lodash-utils';

describe('omit', () => {
  it('should omit specified properties', () => {
    const object1 = { a: 1, b: '2', c: 3 };
    expect(omit(object1, ['a', 'c'])).toEqual({ b: '2' });

    const object2 = { x: 5, y: 6, z: 7 };
    expect(omit(object2, ['y'])).toEqual({ x: 5, z: 7 });

    const object3 = { foo: 'bar', baz: 42 };
    expect(omit(object3, [])).toEqual(object3);

    const object4 = { a: 1, b: '2', c: 3 };
    expect(omit(object4, ['a', 'b', 'c'])).toEqual({});

    const object5 = { first: 'John', last: 'Doe', age: 25 };
    expect(omit(object5, ['age', 'nonExistent'])).toEqual({ first: 'John', last: 'Doe' });
  });
});
