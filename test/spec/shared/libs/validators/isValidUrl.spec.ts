import { isValidURL } from '~/shared/libs/validators';

test('Returns `true` if string URL is valid', () => {
  expect(isValidURL('http://example.com')).toBe(true);
  expect(isValidURL('http://example.com/')).toBe(true);
  expect(isValidURL('https://example.com/')).toBe(true);
  expect(isValidURL('https://example.com')).toBe(true);
  expect(isValidURL('https://example.com/asdf/qwerty')).toBe(true);
  expect(isValidURL('https://example.com:1234')).toBe(true);
  expect(isValidURL('https://example.com:1234/asdf/qwerty')).toBe(true);
});

test('Returns `false` if string URL is invalid', () => {
  expect(isValidURL('/asdf/qwerty')).toBe(false);
  expect(isValidURL('ian@fortmatic.com')).toBe(false);
  expect(isValidURL('1234')).toBe(false);
});

test('Returns `true` if URL object is given', () => {
  expect(isValidURL(new URL('https://example.com'))).toBe(true);
});

test('Returns `false` if argument is `null` or `undefined`', () => {
  expect(isValidURL(undefined)).toBe(false);
  expect(isValidURL(null)).toBe(false);
});
