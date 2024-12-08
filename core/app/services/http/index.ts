import { magicRestUtilities } from './magic-rest';
import { genericJsonRestUtilities } from './json-rest';
import { authRelayerRestUtilities } from './auth-relayer-rest';
import { gasRestUtilities } from './gas-rest';
import { nftRestUtilities } from './nft-rest';

export const HttpService = {
  magic: magicRestUtilities,
  authRelayer: authRelayerRestUtilities,
  json: genericJsonRestUtilities,
  gas: gasRestUtilities,
  nft: nftRestUtilities,
};
