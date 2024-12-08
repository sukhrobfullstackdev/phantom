/* eslint-disable no-template-curly-in-string */

export interface NetworkConfig {
  name: string;
  chainId: number;
  shortName: string;
  chain: string;
  network: string;
  networkId: number;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpc: string[];
  faucets: string[];
  infoURL: string;
}

export const mainnetSupportList: NetworkConfig[] = [
  {
    name: 'Ethereum Mainnet',
    chainId: 1,
    shortName: 'eth',
    chain: 'ETH',
    network: 'mainnet',
    networkId: 1,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpc: ['https://mainnet.infura.io/v3/${INFURA_API_KEY}', 'https://api.mycryptoapi.com/eth'],
    faucets: [],
    infoURL: 'https://ethereum.org',
  },

  {
    name: 'Matic Alpha',
    chainId: 4626,
    shortName: 'matic',
    chain: 'ETH',
    network: 'mainnet',
    networkId: 4626,
    nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
    rpc: ['https://alpha.ethereum.matic.network/'],
    faucets: [],
    infoURL: 'https://matic.network/',
  },
];
