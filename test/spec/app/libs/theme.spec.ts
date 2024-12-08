import { isDefaultTheme, defaultTheme } from '~/app/libs/theme';

test('Returns true if given argument is deeply equal to the default theme', () => {
  expect(isDefaultTheme(defaultTheme)).toBe(true);
});

test('Returns false if given argument is NOT deeply equal to the default theme', () => {
  expect(isDefaultTheme({} as any)).toBe(false);
});

test('Returns true if argument[key] is deeply equal to the default theme', () => {
  expect(isDefaultTheme({ appName: 'Magic' } as any, 'appName')).toBe(true);
});

test('Returns false if argument[key] is NOT deeply equal to the default theme', () => {
  expect(isDefaultTheme({ appName: 'asdfasdf' } as any, 'appName')).toBe(false);
});
