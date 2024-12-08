import WalletConnectProvider from '@walletconnect/web3-provider';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { get, sample } from '~/app/libs/lodash-utils';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { initializeProvider } from '@metamask/providers';
import { ethereum } from '~/app/constants/ethereum';
import { getChainId, getETHNetworkUrl, isCustomNode } from '~/app/libs/network';
import { store } from '~/app/store';
import { DEPLOY_ENV } from '~/shared/constants/env';
import { connectStore } from '../store';
import { connectLogout } from '../store/connect.thunks';
import {
  ETH_SENDTRANSACTION,
  ETH_SEND_GASLESS_TRANSACTION,
  ETH_SIGNTYPEDDATA_V3,
  ETH_SIGNTYPEDDATA_V4,
  PERSONAL_SIGN,
} from '~/app/constants/eth-rpc-methods';

interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

export const isSignTypedData = method => {
  return method === ETH_SIGNTYPEDDATA_V3 || method === ETH_SIGNTYPEDDATA_V4 || method === ETH_SEND_GASLESS_TRANSACTION;
};

export const isRequestingSignature = method => {
  return (
    method === ETH_SIGNTYPEDDATA_V3 ||
    method === PERSONAL_SIGN ||
    method === ETH_SIGNTYPEDDATA_V4 ||
    method === ETH_SENDTRANSACTION ||
    method === ETH_SEND_GASLESS_TRANSACTION
  );
};

export const getCoinbaseWalletProvider = async () => {
  const { Theme } = store.getState();
  const APP_NAME = Theme.theme.appName;
  const APP_LOGO_URL = Theme.theme.logoImage;
  const coinbaseWallet = new CoinbaseWalletSDK({
    appName: APP_NAME,
    appLogoUrl: APP_LOGO_URL,
    darkMode: Theme.theme.isDarkTheme,
  });
  const jsonRpcUrl = getETHNetworkUrl();
  return coinbaseWallet.makeWeb3Provider(jsonRpcUrl);
};

export const getWalletConnectProvider = async () => {
  let rpcUrl;
  let chainId;

  // If custom node URL, need to add that to the rpc list
  if (isCustomNode()) {
    rpcUrl = getETHNetworkUrl();
    chainId = Number(await getChainId());
  }

  return new WalletConnectProvider({
    rpc: {
      1: sample(get(ethereum, `provider_http_urls.${DEPLOY_ENV}.mainnet`)),
      5: sample(get(ethereum, `provider_http_urls.${DEPLOY_ENV}.goerli`)),
      ...(isCustomNode() && { [chainId]: rpcUrl }),
    },
  });
};

/**
 * Necessary in case user refreshes page on QR code screen.
 * Otherwise, after refresh, developer's app will hang on any rpc request.
 */
export const resetWalletConnectInitialization = async () => {
  const isInitialized = window.localStorage.getItem('walletconnect');
  if (!isInitialized) {
    await connectStore.dispatch(connectLogout());
  }
};

export const handleWCDisconnectEvent = async () => {
  window.localStorage.removeItem('walletconnect');
  await connectStore.dispatch(connectLogout());
};

export const getMetamaskNetworkConfigFromChainId = (chainId): AddEthereumChainParameter | undefined => {
  if (chainId === '0x13881') {
    return {
      chainId,
      chainName: 'Mumbai',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: [getETHNetworkUrl() as string],
      blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    };
  }
  if (chainId === '0x89') {
    return {
      chainId,
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: [getETHNetworkUrl() as string],
      blockExplorerUrls: ['https://polygonscan.com/'],
    };
  }
  if (chainId === '0x1a4') {
    return {
      chainId,
      chainName: 'Optimism Goerli Testnet',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: [getETHNetworkUrl() as string],
      blockExplorerUrls: ['https://blockscout.com/optimism/goerli'],
    };
  }
  if (chainId === '0xa') {
    return {
      chainId,
      chainName: 'Optimism',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: [getETHNetworkUrl() as string],
      blockExplorerUrls: ['https://optimistic.etherscan.io'],
    };
  }
  return undefined;
};

// Due to https://github.com/MetaMask/metamask-extension/issues/3133
export const injectMetamaskProviderInFirefox = () => {
  if ((window as any).ethereum) {
    return;
  }
  // setup background connection
  const metamaskStream = new WindowPostMessageStream({
    name: 'metamask-inpage',
    target: 'metamask-contentscript',
  });

  // this will initialize the provider and set it as window.ethereum
  initializeProvider({
    // @ts-ignore
    connectionStream: metamaskStream,
    shouldShimWeb3: true,
  });
};
