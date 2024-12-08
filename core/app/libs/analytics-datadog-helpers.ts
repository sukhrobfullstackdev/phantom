import { DEPLOY_ENV, IS_DEPLOY_ENV_DEV } from '~/shared/constants/env';
import { isGlobalAppScope } from './connect-utils';
import { TrackingSourceMagic, TrackingSourceMagicConnect } from '../constants/flags';
import { getEnvironmentTypeFromQueryParams, getOptionsFromEndpoint } from './query-params';
import { store } from '../store';
import { getCustomNodeNetworkUrl, getNetworkName, getWalletType } from '~/app/libs/network';
import { getTraceIdFromWindow } from '~/app/libs/trace-id';

import { Endpoint } from '~/server/routes/endpoint';
import { getApiKey } from '~/app/libs/api-key';

import { getErrorMessage } from '~/app/libs/exceptions';

// NOTE: do NOT user getLogger in this file, it will cause circular dependency

export function buildMessageContext(error: unknown, context = {}) {
  return {
    message: getErrorMessage(error),
    ...context,
  };
}

/**
 * Magic, Connect
 */
const getSource = () => {
  return isGlobalAppScope() ? TrackingSourceMagicConnect : TrackingSourceMagic;
};

const getEnv = () =>
  DEPLOY_ENV + (!IS_DEPLOY_ENV_DEV && getEnvironmentTypeFromQueryParams() === 'testnet' ? '-testnet' : '');

/**
 * Returns basic default properties for user/enviroment to be tracked
 * keys used here can be passed from actual call to overwrite the default value here
 */

const getBlockchainNetwork = () => {
  const customNodeNetworkUrl = getCustomNodeNetworkUrl();
  return customNodeNetworkUrl || getNetworkName();
};

const analyticsChainId = () => {
  // No chainID for non-evm chains
  if (getWalletType() !== 'ETH') {
    return '';
  }

  // Handle if dev is using Magic node infra
  const rpcUrl: 'mainnet' | 'sepolia' | 'goerli' | string = getBlockchainNetwork();
  if (rpcUrl === 'mainnet') return '1';
  if (rpcUrl === 'goerli') return '5';
  if (rpcUrl === 'sepolia') return '11155111';

  // Handle custom node
  const { ETH_NETWORK: networkConfig } = getOptionsFromEndpoint(Endpoint.Client.SendV1);
  const { chainId } = networkConfig as {
    rpcUrl: string;
    chainId?: number | undefined;
    chainType?: string | undefined;
  };

  return chainId?.toString() || '';
};

const analyticsChainIdToBlockchain = {
  1: 'ethereum mainnet',
  5: 'goerli',
  11155111: 'sepolia',
  137: 'polygon mainnet',
  80001: 'polygon testnet',
  80002: 'polygon testnet',
  '0x13881': 'polygon testnet',
  100: 'gnosis mainnet',
  '0x64': 'gnosis mainnet',
  1351057110: 'skale testnet',
  503129905: 'skale testnet',
  20180427: 'stability testnet',
  33101: 'zilliqa EVM tesntet',
  42161: 'arbitrum one',
  42170: 'arbitrum nova',
  421614: 'arbitrum sepolia',
  421613: 'arbitrum goerli',
  420: 'optimism goerli',
  10: 'optimism mainnet',
  56: 'binance smart chain mainnet',
  97: 'binance smart chain testnet',
  43114: 'avalanche mainnet',
  43113: 'avalanche testnet',
  8453: 'base mainnet',
  84532: 'base sepolia',
  84531: 'base goerli',
  25: 'cronos mainnet',
  338: 'cronos testnet',
  42220: 'celo mainnet',
  44787: 'celo alfajores',
  250: 'fantom mainnet',
  4002: 'fantom testnet',
  1284: 'moonbeam mainnet',
  1287: 'moonbase alpha testnet',
  592: 'astar mainnet',
  81: 'astar shibuya testnet',
  6038361: 'astar zkEVM testnet (zkyoto)',
  3776: 'astar zkEVM mainnet',
  88888: 'chiliz mainnet',
  88880: 'chiliz scoville testnet',
  1666600000: 'harmony mainnet',
  1666600001: 'harmony mainnet',
  1666600002: 'harmony mainnet',
  1666600003: 'harmony mainnet',
  1666700000: 'harmony testnet',
  1666700001: 'harmony testnet',
  295: 'hedera mainnet',
  296: 'hedera testnet',
  7000: 'zetachain mainnet',
  7001: 'zetachain testnet',
  416: 'sx network mainnet',
  647: 'sx network testnet',
  324: 'zkSync mainnet',
  280: 'zkSync testnet',
  13472: 'immutable zkEVM testnet',
};

const getBlockchainName = () => {
  if (getWalletType() !== 'ETH') {
    return getWalletType();
  }

  // No entry in `analyticsChainIdToBlockchain` for chainId
  if (!analyticsChainIdToBlockchain[analyticsChainId()]) return '';

  return analyticsChainIdToBlockchain[analyticsChainId()];
};

export const getBaseProperties = () => {
  const { Auth, System, ActivePayload } = store.getState();
  const { sdk } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);

  return {
    uid: Auth.userID || '',
    sdk,
    eventOrigin: System.eventOrigin,
    app_key: getApiKey(), // don't remove for Segment backwards compatibility
    api_key: getApiKey(), // add for easy searchability in DataDog
    source: getSource(),
    env: getEnv(),
    blockchain: getBlockchainName(),
    rpcUrl: getBlockchainNetwork(),
    chainId: analyticsChainId(),
    json_rpc_method: ActivePayload?.activePayload?.method || '',
    walletType: getWalletType(),
    trace_id: getTraceIdFromWindow(),
  };
};
