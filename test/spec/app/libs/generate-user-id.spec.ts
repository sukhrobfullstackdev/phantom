import { generateUserId } from '~/app/libs/generate-user-id';

const checksumPublicAddress = '0x04668Ec2f57cC15c381b461B9fEDaB5D451c8F7F';
const nonChecksumPublicAddress = '0x04668ec2f57cc15c381b461b9fedab5d451c8f7f'; // all lowercase

test('Returns did-encoded public address from checksummed public address', () => {
  expect(generateUserId(checksumPublicAddress)).toBe('did:ethr:0x04668Ec2f57cC15c381b461B9fEDaB5D451c8F7F');
});

test('Returns did-encoded public address from non-checksummed plain public address', () => {
  expect(generateUserId(nonChecksumPublicAddress)).toBe('did:ethr:0x04668Ec2f57cC15c381b461B9fEDaB5D451c8F7F');
});

test('Returns null if publicAddress input is null', () => {
  expect(generateUserId(null)).toBe(`did:ethr:null`);
});
