import { inflateString } from '~/app/libs/compression';

test('Returns decompressed string given Base64-encoded binary data', () => {
  expect(inflateString('H4sIAAAAAAAA/8tIzcnJVyjPL8pJAQCFEUoNCwAAAA==')).toBe('hello world');
});

test('Throws if given non-Base64 data', () => {
  expect(() => inflateString('asdf')).toThrow('incorrect header check');
});
