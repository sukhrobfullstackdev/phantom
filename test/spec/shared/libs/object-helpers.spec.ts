import { pickBy, camelizeSnakeKeys } from '~/shared/libs/object-helpers';

describe('pickBy', () => {
  it('should return an object with only the truthy values', () => {
    const obj = {
      a: 1,
      b: 0,
      c: null,
      d: undefined,
      e: false,
      f: '',
      g: 'hello',
    };

    const expected = {
      a: 1,
      g: 'hello',
    };

    const actual = pickBy(obj);

    expect(actual).toEqual(expected);
  });

  it('should return an empty object if all values are falsy', () => {
    const obj = {
      a: 0,
      b: null,
      c: undefined,
      d: false,
      e: '',
    };

    const expected = {};

    const actual = pickBy(obj);

    expect(actual).toEqual(expected);
  });

  it('should return an empty object if the input is an empty object', () => {
    const obj = {};

    const expected = {};

    const actual = pickBy(obj);

    expect(actual).toEqual(expected);
  });

  it('should return an object with only the values that pass the predicate', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };

    const expected = {
      b: 2,
      c: 3,
    };

    const actual = pickBy(obj, value => value > 1);

    expect(actual).toEqual(expected);
  });

  it('should return an empty object if none of the values pass the predicate', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };

    const expected = {};

    const actual = pickBy(obj, value => value > 3);

    expect(actual).toEqual(expected);
  });
});

describe('camelizeSnakeKeys', () => {
  const tests = [
    {
      assert: { hello_world: 'helloWorld' },
      expected: { helloWorld: 'helloWorld' },
    },
    {
      assert: {
        pizza: 'yum',
      },
      expected: {
        pizza: 'yum',
      },
    },
    {
      assert: {
        dog_bark: 'woof',
        cool_recursion: {
          goat_yoga: 'bah',
          hello_cat: 'meow',
        },
      },
      expected: {
        dogBark: 'woof',
        coolRecursion: {
          goatYoga: 'bah',
          helloCat: 'meow',
        },
      },
    },
    {
      assert: {
        cool_recursion: {
          goat_yoga: 'bah',
          more_animals: {
            dog_bark: 'woof',
            hello_cat: 'meow',
          },
        },
      },
      expected: {
        coolRecursion: {
          goatYoga: 'bah',
          moreAnimals: {
            dogBark: 'woof',
            helloCat: 'meow',
          },
        },
      },
    },
    {
      assert: {
        this_many: 1,
        string: 'yay',
        is_this_an_object: {
          yes: true,
        },
        is_this_an_array: [1, 2, 3],
      },
      expected: {
        thisMany: 1,
        string: 'yay',
        isThisAnObject: {
          yes: true,
        },
        isThisAnArray: [1, 2, 3],
      },
    },
    {
      assert: {
        cool_things: [1, true, { hello_world: 'helloWorld' }],
      },
      expected: {
        coolThings: [1, true, { helloWorld: 'helloWorld' }],
      },
    },
    {
      assert: {
        really_long_key_that_was_hard_to_type_i_should_stop_doing_this: 'hello',
      },
      expected: {
        reallyLongKeyThatWasHardToTypeIShouldStopDoingThis: 'hello',
      },
    },
    {
      assert: null,
      expected: null,
    },
  ];

  tests.forEach(({ assert, expected }, i: number) => {
    it(`should convert snake case object #${i + 1} into camel case`, () => {
      expect(camelizeSnakeKeys<typeof assert>(assert)).toEqual(expected);
    });
  });
});
