import { isValidColor } from '~/shared/libs/validators';

test('Returns `true` if given value is a color', () => {
  expect(isValidColor('#000')).toBe(true);
  expect(isValidColor('#ffffff')).toBe(true);
  expect(isValidColor('red')).toBe(true);
  expect(isValidColor('green')).toBe(true);
  expect(isValidColor('blue')).toBe(true);
});

test('Returns `false` if given value is not a color', () => {
  expect(isValidColor('asdfasdf')).toBe(false);
  expect(isValidColor('fff')).toBe(false);
  expect(isValidColor('1234')).toBe(false);
  expect(isValidColor('#GGG')).toBe(false);
});

test('Returns `false` if argument is `null` or `undefined`', () => {
  expect(isValidColor(undefined)).toBe(false);
  expect(isValidColor(null)).toBe(false);
});
