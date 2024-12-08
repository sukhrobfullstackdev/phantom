import { Flex, MonochromeIconDefinition } from '@magiclabs/ui';
import React, { createContext, useEffect, useState } from 'react';
import { knownRpcUrlToChainId } from '~/app/constants/url-to-chain-id-map';
import { getETHNetworkUrl } from '~/app/libs/network';
import { getChainId } from '~/app/services/web3/eth-methods';
import { store } from '~/app/store';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { setChainId } from '~/app/store/auth/auth.actions';
import {
  Ethereum,
  OptimismIcon,
  Poa,
  Polygon,
  Zeta,
  Chiliz,
  Stability,
  Optimism,
  BNBIcon,
  BASE,
  ArbitrumOne,
  Arbitrum,
  zkSync,
  Tezos,
  Etherlink,
} from '~/shared/svg/magic-connect';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { rejectPayload } from '~/app/rpc/utils';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { NETWORK_NAMES } from '~/app/constants/network-names';

export interface IChainInfo {
  chainId: number;
  currency: string;
  onramperCurrency: string;
  name: string;
  network: string;
  isMainnet: boolean;
  networkName: string;
  tokenCompatibility: string;
  blockExplorer: string;
  gasStationUrl?: string;
  tokenIcon: MonochromeIconDefinition;
  blockchainIcon: MonochromeIconDefinition;
  faucetUrl?: string;
  transactionFormat: string;
}

export const ChainInfoContext = createContext<null | IChainInfo>(null);

export const networksByChainId = {
  '1': {
    chainId: 1,
    network: 'ethereum',
    isMainnet: true,
    networkName: NETWORK_NAMES.ETHEREUM,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'ETH',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://etherscan.io',
    tokenIcon: Ethereum,
    blockchainIcon: Ethereum,
    transactionFormat: 'Ethereum',
  },
  '5': {
    chainId: 5,
    network: 'goerli',
    isMainnet: false,
    networkName: NETWORK_NAMES.GOERLI,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'ETH',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://goerli.etherscan.io',
    tokenIcon: Ethereum,
    blockchainIcon: Ethereum,
    faucetUrl: 'https://goerlifaucet.com/',
    transactionFormat: 'Ethereum',
  },
  '11155111': {
    chainId: 11155111,
    network: 'sepolia',
    isMainnet: false,
    networkName: NETWORK_NAMES.SEPOLIA,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'ETH',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://sepolia.etherscan.io',
    tokenIcon: Ethereum,
    blockchainIcon: Ethereum,
    faucetUrl: 'https://sepoliafaucet.com/',
    transactionFormat: 'Ethereum',
  },
  '137': {
    chainId: 137,
    network: 'polygon-mainnet',
    isMainnet: true,
    networkName: NETWORK_NAMES.POLYGON,
    name: 'Polygon',
    currency: 'MATIC',
    onramperCurrency: 'matic_polygon',
    tokenCompatibility: 'Polygon',
    blockExplorer: 'https://polygonscan.com',
    gasStationUrl: 'https://gasstation.polygon.technology/v2',
    tokenIcon: Polygon,
    blockchainIcon: Polygon,
    transactionFormat: 'Polygon',
  },
  '80001': {
    chainId: 80001,
    network: 'polygon-mumbai',
    isMainnet: false,
    networkName: NETWORK_NAMES.POLYGON_MUMBAI,
    name: 'Polygon',
    currency: 'MATIC',
    onramperCurrency: 'matic_polygon',
    tokenCompatibility: 'Polygon',
    blockExplorer: 'https://mumbai.polygonscan.com',
    gasStationUrl: 'https://gasstation-testnet.polygon.technology/v2',
    tokenIcon: Polygon,
    blockchainIcon: Polygon,
    faucetUrl: 'https://faucet.polygon.technology/',
    transactionFormat: 'Polygon',
  },
  '80002': {
    chainId: 80002,
    network: 'polygon-amoy',
    isMainnet: false,
    networkName: NETWORK_NAMES.POLYGON_AMOY,
    name: 'Polygon',
    currency: 'MATIC',
    onramperCurrency: 'matic_polygon',
    tokenCompatibility: 'Polygon',
    blockExplorer: 'https://www.oklink.com/amoy',
    tokenIcon: Polygon,
    blockchainIcon: Polygon,
    faucetUrl: 'https://faucet.polygon.technology/',
    transactionFormat: 'Polygon',
  },
  '420': {
    chainId: 420,
    network: 'optimistic-goerli',
    isMainnet: false,
    networkName: NETWORK_NAMES.OPTIMISM_GOERLI,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'eth_optimism',
    tokenCompatibility: 'ETH',
    blockExplorer: 'https://blockscout.com/optimism/goerli',
    tokenIcon: Optimism,
    blockchainIcon: OptimismIcon,
    faucetUrl: 'https://community.optimism.io/docs/useful-tools/faucets/',
    transactionFormat: 'Optimism',
  },
  '10': {
    chainId: 10,
    network: 'optimistic-mainnet',
    isMainnet: true,
    networkName: NETWORK_NAMES.OPTIMISM,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'eth_optimism',
    tokenCompatibility: 'ETH',
    blockExplorer: 'https://optimistic.etherscan.io',
    tokenIcon: Optimism,
    blockchainIcon: OptimismIcon,
    transactionFormat: 'Optimism',
  },
  '7000': {
    chainId: 7000,
    network: 'zeta-mainnet',
    isMainnet: true,
    networkName: 'Zeta',
    name: 'Zeta',
    currency: 'ZETA',
    onramperCurrency: 'ZETA',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://explorer.zetachain.com',
    tokenIcon: Zeta,
    blockchainIcon: Zeta,
    transactionFormat: 'Zeta',
  },
  // Note. Zeta Testnet doesn't have a faucet website. Please follow this instruction.
  // https://www.zetachain.com/docs/reference/get-testnet-zeta/#how-to-get-testnet-zeta
  '7001': {
    chainId: 7001,
    network: 'zeta-testnet',
    isMainnet: true,
    networkName: 'Zeta Testnet',
    name: 'Zeta',
    currency: 'aZETA',
    onramperCurrency: 'aZETA',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://zetachain-athens-3.blockscout.com',
    tokenIcon: Zeta,
    blockchainIcon: Zeta,
    transactionFormat: 'Zeta',
  },
  '88888': {
    chainId: 88888,
    network: 'chiliz-mainnet',
    isMainnet: true,
    networkName: 'Chiliz',
    name: 'Chiliz',
    currency: 'CHZ',
    onramperCurrency: 'CHZ',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://scan.chiliz.com',
    tokenIcon: Chiliz,
    blockchainIcon: Chiliz,
    transactionFormat: 'Chiliz',
  },
  '88882': {
    chainId: 88882,
    network: 'chiliz-testnet',
    isMainnet: true,
    networkName: 'Spicy Testnet',
    name: 'Chiliz',
    currency: 'CHZ',
    onramperCurrency: 'CHZ',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://spicy-explorer.chiliz.com',
    tokenIcon: Chiliz,
    blockchainIcon: Chiliz,
    transactionFormat: 'Chiliz',
  },
  '99': {
    chainId: 99,
    network: 'poa-mainnet',
    isMainnet: true,
    networkName: 'POA',
    name: 'POA',
    currency: 'POA',
    onramperCurrency: 'POA',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://blockscout.com/poa/core',
    tokenIcon: Poa,
    blockchainIcon: Poa,
    transactionFormat: 'POA',
  },
  '77': {
    chainId: 77,
    network: 'poa-testnet',
    isMainnet: false,
    networkName: 'Sokol Testnet',
    name: 'POA',
    currency: 'POA',
    onramperCurrency: 'POA',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://blockscout.sokol.arianee.net',
    tokenIcon: Poa,
    blockchainIcon: Poa,
    transactionFormat: 'POA',
  },
  '101010': {
    chainId: 101010,
    network: 'global-trust-network', // stability mainnet
    isMainnet: true,
    networkName: 'Global Trust Network',
    name: 'Stability',
    currency: '-', // no native token
    onramperCurrency: 'SUSD',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://globaltrustnetwork.blockscout.com/',
    tokenIcon: Stability,
    blockchainIcon: Stability,
    transactionFormat: 'Stability',
  },
  '20180427': {
    chainId: 20180427,
    network: 'stability-testnet',
    isMainnet: false,
    networkName: 'Stability Testnet',
    name: 'Stability',
    currency: 'SUSD', // Fake: https://stability-betanet.blockscout.com/token/0xC814444DecA35e56c59b51C858c26213d6977F90
    onramperCurrency: 'SUSD',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://stability-testnet.blockscout.com',
    tokenIcon: Stability,
    blockchainIcon: Stability,
    transactionFormat: 'Stability',
  },
  '56': {
    chainId: 56,
    network: 'bnb-smart-chain-mainnet',
    isMainnet: true,
    networkName: 'BNB Smart Chain',
    name: 'BNB',
    currency: 'BNB',
    onramperCurrency: 'bnb_bsc',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://bscscan.com',
    tokenIcon: BNBIcon,
    blockchainIcon: BNBIcon,
    transactionFormat: 'BNB',
  },
  '97': {
    chainId: 97,
    network: 'bnb-smart-chain-testnet',
    isMainnet: false,
    networkName: 'BNB Smart Chain Testnet',
    name: 'BNB',
    currency: 'BNB',
    onramperCurrency: 'bnb_bsc',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://testnet.bscscan.com',
    tokenIcon: BNBIcon,
    blockchainIcon: BNBIcon,
    faucetUrl: 'https://faucet.quicknode.com/binance-smart-chain/bnb-testnet',
    transactionFormat: 'BNB',
  },
  // TODO: base needs custom tx handling - currently using Ethereum gas prices
  '8453': {
    chainId: 8453,
    network: 'base-mainnet',
    isMainnet: true,
    networkName: NETWORK_NAMES.BASE,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'eth_base',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://basescan.org',
    tokenIcon: Ethereum,
    blockchainIcon: BASE,
    transactionFormat: 'BASE',
  },
  '84531': {
    chainId: 84531,
    network: 'base-goerli',
    isMainnet: false,
    networkName: 'Base Goerli Testnet',
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'ETH',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://goerli.basescan.org',
    tokenIcon: Ethereum,
    blockchainIcon: BASE,
    faucetUrl: 'https://faucet.quicknode.com/base/goerli',
    transactionFormat: 'BASE',
  },
  '84532': {
    chainId: 84532,
    network: 'base-sepolia',
    isMainnet: false,
    networkName: NETWORK_NAMES.BASE_SEPOLIA,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'ETH',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://sepolia-explorer.base.org',
    tokenIcon: Ethereum,
    blockchainIcon: BASE,
    faucetUrl: 'https://faucet.quicknode.com/base/sepolia',
    transactionFormat: 'BASE',
  },
  '42161': {
    chainId: 42161,
    network: 'arbitrum-one',
    isMainnet: true,
    networkName: NETWORK_NAMES.ARBITRUM_ONE,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'ETH',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://arbiscan.io',
    tokenIcon: Ethereum,
    blockchainIcon: ArbitrumOne,
    transactionFormat: 'Arbitrum',
  },
  '421614': {
    chainId: 421614,
    network: 'arbitrum-sepolia',
    isMainnet: false,
    networkName: NETWORK_NAMES.ARBITRUM_SEPOLIA,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'ETH',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://sepolia.arbiscan.io',
    tokenIcon: Ethereum,
    blockchainIcon: Arbitrum,
    faucetUrl: 'https://faucet.quicknode.com/arbitrum/sepolia',
    transactionFormat: 'Arbitrum',
  },
  '324': {
    chainId: 324,
    network: 'zksync-mainnet',
    isMainnet: true,
    networkName: NETWORK_NAMES.ZKSYNC_MAINNET,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'ETH',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://explorer.zksync.io',
    tokenIcon: Ethereum,
    blockchainIcon: zkSync,
    transactionFormat: 'zkSync',
  },
  '300': {
    chainId: 300,
    network: 'zksync-sepolia',
    isMainnet: false,
    networkName: NETWORK_NAMES.ZKSYNC_SEPOLIA,
    name: 'Ethereum',
    currency: 'ETH',
    onramperCurrency: 'ETH',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://sepolia.explorer.zksync.io',
    tokenIcon: Ethereum,
    blockchainIcon: zkSync,
    faucetUrl: 'https://faucet.chainstack.com/zksync-testnet-faucet',
    transactionFormat: 'zkSync',
  },
  '128123': {
    chainId: 128123,
    network: 'etherlink-testnet',
    isMainnet: false,
    networkName: NETWORK_NAMES.ETHERLINK_TESTNET,
    name: 'Tezos',
    currency: 'XTZ',
    onramperCurrency: 'XTZ',
    tokenCompatibility: 'ERC-20',
    blockExplorer: 'https://testnet-explorer.etherlink.com/',
    tokenIcon: Tezos,
    blockchainIcon: Etherlink,
    faucetUrl: 'https://faucet.etherlink.com/',
    transactionFormat: 'etherlink',
  },
};

export const ChainInfo = ({ children }) => {
  const payload = useUIThreadPayload();
  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const [chainInfo, setChainInfo] = useState<null | IChainInfo>(null);

  useEffect(() => {
    const nodeUrl = getETHNetworkUrl();
    if (nodeUrl) {
      const baseUrl = nodeUrl.split('/')[2];
      if (knownRpcUrlToChainId[baseUrl]) {
        const verifiedChainInfo = networksByChainId[knownRpcUrlToChainId[baseUrl]];
        store.dispatch(setChainId(verifiedChainInfo.chainId.toString()));
        return setChainInfo(verifiedChainInfo);
      }
    }
    const fetchChainId = async () => {
      const verifiedChainInfo = networksByChainId[Number((await getChainId()) || 1)];
      if (!verifiedChainInfo) {
        if (payload) {
          return rejectPayload(payload, sdkErrorFactories.web3.unsupportedBlockchain());
        }
      }
      store.dispatch(setChainId(verifiedChainInfo.chainId.toString()));
      setChainInfo(verifiedChainInfo);
    };
    fetchChainId().catch(e => {
      getLogger().error(`Error with fetchChainId`, buildMessageContext(e));
      if (!payload) return;
      return rejectPayload(payload, sdkErrorFactories.web3.errorConnectingToBlockchain());
    });
  }, [walletAddress]);

  return (
    <ChainInfoContext.Provider value={chainInfo}>
      {chainInfo ? (
        children
      ) : (
        <Flex.Row justifyContent="center" alignItems="center" style={{ height: '150px' }}>
          <LoadingSpinner />
        </Flex.Row>
      )}
    </ChainInfoContext.Provider>
  );
};
