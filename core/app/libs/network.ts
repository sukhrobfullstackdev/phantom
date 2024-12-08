import { find, get, isEmpty, isObject, lowerCase, map, sample, upperCase } from '~/app/libs/lodash-utils';
import semver from 'semver';
import { isMobileSDK } from '~/app/libs/platform';
import { Endpoint } from '~/server/routes/endpoint';
import { DEPLOY_ENV } from '~/shared/constants/env';
import { ethereum } from '../constants/ethereum';
import { SDKType, SupportedNetwork, WalletType } from '../constants/flags';
import { LedgerSupportDictionary } from '../constants/ledger-support';
import { mainnetSupportList } from '../constants/mainnet-support';
import { getApiKey } from './api-key';
import { sdkErrorFactories } from './exceptions';
import { Options, getOptionsFromEndpoint } from './query-params';

const deprecateTestAPIKeyVersion = '7.0.0';
const deprecateLegacyTestnetVersion = '10.0.0';

export function supportsCustomNode() {
  const { sdk } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);

  switch (sdk) {
    case SDKType.MagicRN:
    case SDKType.MagicBareRN:
    case SDKType.MagicExpoRN:
    case SDKType.MagicSDK:
    case SDKType.MagicIOS:
    case SDKType.MagicAndroid:
    case SDKType.MagicFlutter:
    case SDKType.MagicUnity:
      return true;

    default:
      return false;
  }
}

export const isMainnet = () => {
  return getNetworkName() === 'mainnet' || getNetworkName() === 'MAINNET';
};

export function getNetworkName() {
  const { ETH_NETWORK, version = '1.0.2' } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
  const apiKey = getApiKey();

  const semverVersion = semver.valid(semver.coerce(version));

  if (getWalletType() === 'FLOW') {
    const options = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
    const flowOptions = get(options, 'ext.flow');
    return flowOptions.network.toLocaleLowerCase() === 'mainnet' ? 'MAINNET' : 'CANONICAL_TESTNET';
  }

  if (getWalletType() === WalletType.APTOS) {
    const { nodeUrl } = getWalletExtensionOptions();
    const network =
      nodeUrl && typeof nodeUrl === 'string'
        ? nodeUrl
            .split('.')
            .filter(str => str.match(/[a-zA-Z0-9]*net/))
            .pop()
        : 'unknown';
    return network ?? 'custom';
  }

  if (getWalletType() === 'HEDERA') {
    const options = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
    const hederaOptions = get(options, 'ext.hedera');
    return hederaOptions.options.network === 'mainnet' ? 'mainnet' : 'CANONICAL_TESTNET';
  }

  if (semverVersion !== null && semver.gte(deprecateLegacyTestnetVersion, semverVersion)) {
    if (isEmpty(ETH_NETWORK)) return 'mainnet';
    if (isCustomNode()) return 'mainnet';
    if (isObject(ETH_NETWORK) && isEmpty((ETH_NETWORK as any)?.rpcUrl)) return 'mainnet';

    type NetworkType = (typeof SupportedNetwork)[number];
    // eslint-disable-next-line no-throw-literal
    if (!SupportedNetwork.includes((ETH_NETWORK as string).toLowerCase() as NetworkType)) throw 'Network not supported';

    return (ETH_NETWORK as string).toLowerCase();
  }

  // New Version Mapping
  const newVersionNetworkMapping = () => {
    if (apiKey.toLowerCase().startsWith('pk_test') && isEmpty(ETH_NETWORK)) return 'goerli';
    if (isEmpty(ETH_NETWORK)) return 'mainnet';

    if (isCustomNode()) return 'mainnet';
    if (isObject(ETH_NETWORK) && isEmpty((ETH_NETWORK as any)?.rpcUrl)) return 'mainnet';

    return (ETH_NETWORK as string).toLowerCase();
  };

  // MobileSDK overwrites
  if (isMobileSDK()) {
    return newVersionNetworkMapping();
  }

  if (semverVersion !== null && semver.gt(deprecateTestAPIKeyVersion, semverVersion)) {
    // Old Version
    if (apiKey.toLowerCase().startsWith('pk_live')) return 'mainnet';
    if (isEmpty(ETH_NETWORK)) return 'goerli';
    if (isCustomNode()) return 'CANONICAL_TESTNET';
    if (isObject(ETH_NETWORK) && isEmpty((ETH_NETWORK as any)?.rpcUrl)) return 'goerli';
  } else {
    return newVersionNetworkMapping();
  }

  return (ETH_NETWORK as string).toLowerCase();
}

export function getCustomNodeNetworkUrl(): string | undefined {
  const { ETH_NETWORK } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
  return (ETH_NETWORK as any)?.rpcUrl;
}

export function isCustomNode() {
  const { ETH_NETWORK } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
  return !isEmpty((ETH_NETWORK as any)?.rpcUrl);
}

export function verifyNetwork(networkId: number) {
  const network = find(mainnetSupportList, item => item.networkId === networkId);
  const apiKey = getApiKey();

  if (isEmpty(network) && apiKey.startsWith('pk_live')) {
    throw sdkErrorFactories.web3.unsupportedEVM();
  }

  return network;
}

export function isETHWalletType() {
  return getWalletType() === WalletType.ETH;
}

export function isFlowWalletType() {
  return getWalletType() === WalletType.FLOW;
}

export function isLedgerWalletType(walletType) {
  switch (walletType) {
    case 'BITCOIN': {
      return getWalletType() === WalletType.BITCOIN;
    }
    case 'ICON': {
      return getWalletType() === WalletType.ICON;
    }
    case 'HARMONY': {
      return getWalletType() === WalletType.HARMONY;
    }
    case 'SOLANA': {
      return getWalletType() === WalletType.SOLANA;
    }
    case 'SUI': {
      return getWalletType() === WalletType.SUI;
    }
    case 'ZILLIQA': {
      return getWalletType() === WalletType.ZILLIQA;
    }
    case 'TAQUITO': {
      return getWalletType() === WalletType.TAQUITO;
    }
    case 'ALGOD': {
      return getWalletType() === WalletType.ALGOD;
    }
    case 'NEAR': {
      return getWalletType() === WalletType.NEAR;
    }
    case 'HEDERA': {
      return getWalletType() === WalletType.HEDERA;
    }
    case 'COSMOS': {
      return getWalletType() === WalletType.COSMOS;
    }
    case 'FLOW': {
      return getWalletType() === WalletType.FLOW;
    }
    case 'APTOS': {
      return getWalletType() === WalletType.APTOS;
    }
    default: {
      return false;
    }
  }
}

export function getWalletType() {
  const options = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);

  if (!isEmpty(options.ext)) {
    return getMagicExtensionWalletType(options);
  }

  const ETH_NETWORK = options?.ETH_NETWORK;
  return get(ETH_NETWORK, 'chainType', WalletType.ETH) as string;
}

export function getChainId() {
  const options = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
  const ETH_NETWORK = options?.ETH_NETWORK;
  return get(ETH_NETWORK, 'chainId') as number | undefined;
}

export function getWalletExtensionOptions() {
  const options = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);

  if (!isEmpty(options.ext)) {
    return get(options.ext, lowerCase(getMagicExtensionWalletType(options))).options;
  }
}

export function getMagicExtensionWalletType(options: Options[typeof Endpoint.Client.SendLegacy]) {
  const { ext } = options;
  if (!isEmpty(ext)) {
    const extensionKeys = map(Object.keys(ext as object), upperCase);
    const ledgerKeys = Object.keys(LedgerSupportDictionary);

    return (
      [extensionKeys, ledgerKeys].reduce((a, b) => {
        return a.filter(value => {
          return b.includes(value);
        });
      })[0] ?? WalletType.ETH
    );
  }

  return WalletType.ETH;
}

export function getLedgerNodeUrl() {
  const options = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);

  if (!isEmpty(options.ext)) {
    const rpcUrl = get(options.ext, lowerCase(getMagicExtensionWalletType(options)))?.rpcUrl;
    if (rpcUrl) return rpcUrl;
  }

  return getCustomNodeNetworkUrl();
}

export const getETHNetworkUrl = () => {
  const networkName = getNetworkName();
  let nodeUrl: string | undefined;
  if (isCustomNode()) {
    nodeUrl = getCustomNodeNetworkUrl();
  } else {
    nodeUrl = sample(get(ethereum, `provider_http_urls.${DEPLOY_ENV}.${networkName}`));
  }
  return nodeUrl;
};
