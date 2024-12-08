import { isValidEmail } from '~/shared/libs/validators';

test('Returns `true` if given value is an email', () => {
  expect(isValidEmail('ian@fortmatic.com')).toBe(true);
  expect(isValidEmail('1234@fortmatic.com')).toBe(true);
  expect(isValidEmail('sean@fortmatic.com')).toBe(true);
  expect(isValidEmail('dh+1@fortmatic.com')).toBe(true);
  expect(isValidEmail('asdf1234+qwertyfoobar@gmail.com')).toBe(true);
  expect(isValidEmail('support@magic.link')).toBe(true);
});

test('Returns `false` if given value is not an email', () => {
  expect(isValidEmail('asdfasdf')).toBe(false);
  expect(isValidEmail('ian@@fortmatic.com')).toBe(false);
  expect(isValidEmail('1234')).toBe(false);
});

test('Returns `false` if argument is `null` or `undefined`', () => {
  expect(isValidEmail(undefined)).toBe(false);
  expect(isValidEmail(null)).toBe(false);
});
