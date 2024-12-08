import { cssTimeToMilliseconds } from '~/app/libs/css-time-to-milliseconds';

test('Takes negative seconds, returns negative milliseconds', () => {
  expect(cssTimeToMilliseconds('-1000s')).toBe(-1000000);
});

test('Takes negative milliseconds , returns same number in negative milliseconds', () => {
  expect(cssTimeToMilliseconds('-10000ms')).toBe(-10000);
});

test('Takes seconds, returns milliseconds', () => {
  expect(cssTimeToMilliseconds('1000s')).toBe(1000000);
});

test('Takes milliseconds, returns same number in milliseconds', () => {
  expect(cssTimeToMilliseconds('10000ms')).toBe(10000);
});

test('Takes null, returns 0', () => {
  expect(cssTimeToMilliseconds(null)).toBe(0);
});
