import { compareAddresses } from '~/app/libs/web3-utils';

const address = '0x21771ef695759183f8047fa098c6fbe7b78af59b';

test('Assert TRUE, when address is empty', () => {
  expect(compareAddresses([''])).toEqual(true);
});

test('Assert false, when input array is empty', () => {
  expect(compareAddresses([])).toEqual(false);
});

test('Compare address with toCheckum in Web3', () => {
  expect(compareAddresses([address])).toEqual(true);
});
