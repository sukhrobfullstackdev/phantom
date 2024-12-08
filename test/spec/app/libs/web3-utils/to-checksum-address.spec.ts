import sinon from 'sinon';
import { toChecksumAddress } from '~/app/libs/web3-utils';
import * as Network from '~/app/libs/network';

const address = '0x21771ef695759183f8047fa098c6fbe7b78af59b';
const resultAddress = '0x21771ef695759183F8047fA098c6fBE7b78Af59B';
beforeAll(() => {
  sinon.stub(Network, 'getChainId').returns(1);
});

test('Get to CheckSumAddress', () => {
  expect(toChecksumAddress(address)).toEqual(resultAddress);
});

test('CheckSumAddress when input address is 0x0', () => {
  expect(toChecksumAddress('0x0')).toEqual(null);
});

test('CheckSumAddress when input address is an empty string', () => {
  expect(toChecksumAddress('')).toEqual(null);
});
