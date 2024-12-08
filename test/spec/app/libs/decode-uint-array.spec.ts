import { base64BinaryToUint8Array } from '~/app/libs/decode-uint-array';

/* eslint-disable prettier/prettier */
const helloWorldCompressedBytes = new Uint8Array([
   31, 139,  8,   0,   0,   0,  0,  0,   0,
  255, 203, 72, 205, 201, 201, 87, 40, 207,
   47, 202, 73,   1,   0, 133, 17, 74,  13,
   11,   0,  0,   0
]);
/* eslint-enable prettier/prettier */

test('Returns bytes from Base64-encoded binary data', () => {
  expect(base64BinaryToUint8Array('H4sIAAAAAAAA/8tIzcnJVyjPL8pJAQCFEUoNCwAAAA==')).toEqual(helloWorldCompressedBytes);
});

test('Passes empty string as default argument', () => {
  expect(base64BinaryToUint8Array()).toEqual(new Uint8Array());
});
