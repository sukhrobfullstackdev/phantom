import { isValidJSON } from '~/shared/libs/validators';

test('Returns `true` if given value is a valid JSON string', () => {
  expect(isValidJSON(JSON.stringify({ hello: 'world' }))).toBe(true);
});

test('Returns `true` if given value is a valid JSON-serializable object', () => {
  expect(isValidJSON({ hello: 'world' })).toBe(true);
});

test('Returns `false` if given value is an invalid JSON-serializable object', () => {
  expect(isValidJSON(Object)).toBe(false);
});

test('Returns `false` if argument is `null` or `undefined`', () => {
  expect(isValidJSON(undefined)).toBe(false);
  expect(isValidJSON(null)).toBe(false);
});

test('Returns `false` if argument is an invalid JSON string', () => {
  expect(isValidJSON('asdfasdfasdf')).toBe(false);
});

test('Returns `false` if return value is `null` or `undefined`', () => {
  expect(isValidJSON(NaN)).toBe(false);
});
