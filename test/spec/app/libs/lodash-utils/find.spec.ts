import { find } from '~/app/libs/lodash-utils';

describe('find', () => {
  it('should return the first matching element', () => {
    const users = [
      { user: 'barney', age: 36, active: true },
      { user: 'fred', age: 40, active: false },
      { user: 'pebbles', age: 1, active: true },
    ];
    const result = find(users, o => o.age < 40);
    expect(result).toEqual({ user: 'barney', age: 36, active: true });
  });

  it('should return undefined if no matching elements', () => {
    const users = [
      { user: 'barney', age: 36, active: true },
      { user: 'fred', age: 40, active: false },
      { user: 'pebbles', age: 1, active: true },
    ];
    const result = find(users, o => o.age > 40);
    expect(result).toBeUndefined();
  });

  it('should return undefined if collection is null or undefined', () => {
    const resultFromNull = find(null, o => true);
    expect(resultFromNull).toBeUndefined();

    const resultFromUndefined = find(undefined, o => true);
    expect(resultFromUndefined).toBeUndefined();
  });

  it('should return undefined if predicate is not a function', () => {
    const result = find([1, 2, 3], undefined as any);
    expect(result).toBeUndefined();
  });
});
