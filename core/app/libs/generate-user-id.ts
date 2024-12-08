import { toChecksumAddress } from './web3-utils';

export function generateUserId(publicAddress: string | null) {
  return `did:ethr:${toChecksumAddress(publicAddress)}`;
}
