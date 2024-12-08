import browserEnv from '@ikscodes/browser-env';
import { matchEndpoint } from '~/app/libs/match-endpoint';

beforeEach(() => {
  browserEnv.restore();
});

test('If given ONE argument, performs match against `window.location.pathname`', () => {
  browserEnv.stub('window.location', {
    pathname: '/hello/world',
  });

  expect(matchEndpoint('/hello/:world' as any)).toBe(true);
});

test('If given ONE ARRAY argument, succeeds match against `window.location.pathname` for at least one element', () => {
  browserEnv.stub('window.location', {
    pathname: '/hello/world',
  });

  expect(matchEndpoint(['/hello/:world', 'hello/:planet'] as any)).toBe(true);
});

test('If given ONE ARRAY argument, fails match against `window.location.pathname`', () => {
  browserEnv.stub('window.location', {
    pathname: '/nope/notamatch',
  });

  expect(matchEndpoint(['/hello/:world', 'goodbye/:world'] as any)).toBe(false);
});

test('If given TWO arguments, performs match of argument 1 against argument 2', () => {
  expect(matchEndpoint('/bar/baz', '/bar/:buzz' as any)).toBe(true);
});

test('If given TWO arguments with second as ARRAY, succeeds match of argument 1 against at least one element of argument 2', () => {
  expect(matchEndpoint('/bar/baz', ['/bar/:buzz', 'bar/:bizz'] as any)).toBe(true);
});

test('If given TWO arguments with second as ARRAY, fails match of argument 1 against at least one element of argument 2', () => {
  expect(matchEndpoint('/bar/baz', ['/qwerty/:buzz', '/buzz/:buzz'] as any)).toBe(false);
});

test('Returns `true` for a valid match', () => {
  expect(matchEndpoint('/hello/world', '/hello/world' as any)).toBe(true);
});

test('Returns `false` for an invalid match', () => {
  expect(matchEndpoint('/hello/world', '/bar/baz' as any)).toBe(false);
});
