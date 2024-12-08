import { decodeBase64, decodeBase64URL, encodeBase64, encodeBase64URL } from '~/app/libs/base64';

const helloWorld = 'aGVsbG8gd29ybGQ=';
const helloWorldURL = 'aGVsbG8gd29ybGQ';
const helloWorldURLEncoded = 'aGVsbG8gd29ybGQ%3D';

test('Decodes Base64 data', () => {
  expect(decodeBase64(helloWorld)).toBe('hello world');
});

test('Encodes Base64 data', () => {
  expect(encodeBase64('hello world')).toBe(helloWorld);
});

test('Encodes URL-safe Base64 data', () => {
  expect(encodeBase64URL('hello world')).toBe(helloWorldURL);
});

test('Decodes URL-safe Base64 data', () => {
  expect(decodeBase64URL(helloWorldURL)).toBe('hello world');
  expect(decodeBase64URL(helloWorldURLEncoded)).toBe('hello world');
});
