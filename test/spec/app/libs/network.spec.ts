/* eslint-disable array-callback-return */
import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import semver from 'semver';
import { get, sample } from '~/app/libs/lodash-utils';
import * as network from '~/app/libs/network';
import { SDKType, WalletType } from '~/app/constants/flags';
import { mainnetSupportList } from '~/app/constants/mainnet-support';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { stubGetApiKey, stubGetOptionsFromEndpoint, stubGetWalletType } from '../../_utils/stubs';
import { ethereum } from '../../../../core/app/constants/ethereum';

const sdkType = [
  SDKType.FortmaticAndroid,
  SDKType.FortmaticRN,
  SDKType.FortmaticIOS,
  SDKType.MagicRN,
  SDKType.MagicSDK,
  SDKType.MagicUnity,
];

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
});

test('supports custom node with version fortmatic sdk type return false', () => {
  stubGetOptionsFromEndpoint({ version: '1.0.2', sdk: SDKType.FortmaticSDK });

  const result = network.supportsCustomNode();

  expect(result).toBe(false);
});

test('supports custom node with semverVersion is null', () => {
  stubGetOptionsFromEndpoint({ version: '1.0.2', sdk: SDKType.FortmaticSDK });

  const stubSemver = sinon.stub(semver, 'valid').returns(null);

  const result = network.supportsCustomNode();

  expect(result).toBe(false);

  stubSemver.restore();
});

test('supports custom node with unknown sdk type return false', () => {
  stubGetOptionsFromEndpoint({ version: '1.0.2', sdk: 'unknown' });

  const result = network.supportsCustomNode();

  expect(result).toBe(false);
});

test('is ETH wallet type', () => {
  stubGetWalletType(WalletType.ETH);

  expect(network.isETHWalletType()).toBe(true);
});

test('getNetworkName returns mainnet', () => {
  stubGetOptionsFromEndpoint({ ETH_NETWORK: 'mainnet' });
  stubGetApiKey('pk_live_abc');

  const result = network.getNetworkName();

  expect(result).toEqual('mainnet');
});

test('getNetworkName returns mainnet with null ETH_NETWORK', () => {
  stubGetOptionsFromEndpoint({ ETH_NETWORK: null });
  stubGetApiKey('pk_live_abc');

  const result = network.getNetworkName();

  expect(result).toEqual('mainnet');
});

test('getNetworkName with custom node returns mainnet', () => {
  stubGetOptionsFromEndpoint({ ETH_NETWORK: { rpcUrl: 'mock rpc url' } });
  stubGetApiKey('pk_live_abc');

  const result = network.getNetworkName();

  expect(result).toEqual('mainnet');
});

test('getNetworkName without rpcUrl in ETH_NETWORK returns mainnet', () => {
  stubGetOptionsFromEndpoint({ ETH_NETWORK: { mock: 'unknown' } });
  stubGetApiKey('pk_live_abc');

  const result = network.getNetworkName();

  expect(result).toEqual('mainnet');
});

test('getNetworkName returns ETH_NETWORK value', () => {
  stubGetOptionsFromEndpoint({ ETH_NETWORK: 'goerli' });
  stubGetApiKey('pk_live_abc');

  const result = network.getNetworkName();

  expect(result).toEqual('goerli');
});

test('getNetworkName returns ETH_NETWORK value', () => {
  stubGetOptionsFromEndpoint({ ETH_NETWORK: 'sepolia' });
  stubGetApiKey('pk_live_abc');

  const result = network.getNetworkName();

  expect(result).toEqual('sepolia');
});

test('getCustomNodeNetworkUrl success', () => {
  const mockCustomNodeNetworkUrl = 'https://mock url';
  stubGetOptionsFromEndpoint({ ETH_NETWORK: { rpcUrl: mockCustomNodeNetworkUrl } });

  const result = network.getCustomNodeNetworkUrl();

  expect(result).toEqual(mockCustomNodeNetworkUrl);
});

test('verifyNetwork success', () => {
  const EthMainnet = mainnetSupportList[0];
  stubGetApiKey('pk_test_abc');

  const result = network.verifyNetwork(EthMainnet.networkId);

  expect(result).toEqual(EthMainnet);
});

test('verifyNetwork throw error with pk_live', () => {
  const unknownNetworkId = 123456;

  stubGetApiKey('pk_live_abc');

  expect(() => {
    network.verifyNetwork(unknownNetworkId);
  }).toThrow(sdkErrorFactories.web3.unsupportedEVM());
});

test('getWalletType success returns ETH wallet type', () => {
  stubGetOptionsFromEndpoint({ version: '1.0.2', sdk: SDKType.MagicSDK });

  const result = network.getWalletType();

  expect(result).toEqual(WalletType.ETH);
});

test('getWalletType success returns magic extension wallet type', () => {
  const mockOptions = {
    sdk: SDKType.MagicSDK,
    ext: {
      flow: {
        rpcUrl: 'http://mock url',
        chainType: WalletType.FLOW,
      },
    },
  };

  stubGetOptionsFromEndpoint(mockOptions);

  const result = network.getWalletType();

  expect(result).toEqual(WalletType.FLOW);
});

test('getChainId success return chainId', () => {
  const EthMainnet = mainnetSupportList[0];
  stubGetOptionsFromEndpoint({ ETH_NETWORK: { chainId: EthMainnet.chainId } });

  const result = network.getChainId();

  expect(result).toEqual(EthMainnet.chainId);
});

test('getMagicExtensionWalletType returns ETH wallet type', () => {
  const options = { ext: null };

  const result = network.getMagicExtensionWalletType(options as any);

  expect(result).toEqual(WalletType.ETH);
});

test('getMagicExtensionWalletType return extension wallet type', () => {
  const options = {
    ext: {
      flow: {
        rpcUrl: 'http://mock url',
        chainType: WalletType.FLOW,
      },
    },
  };

  const result = network.getMagicExtensionWalletType(options);

  expect(result).toEqual(WalletType.FLOW);
});

test('getWalletExtensionOptions return falsy', () => {
  const mockOptions = {
    sdk: SDKType.MagicSDK,
    ext: {
      flow: {
        rpcUrl: 'http://mock url',
        chainType: WalletType.FLOW,
      },
    },
  };

  stubGetOptionsFromEndpoint(mockOptions);

  const result = network.getWalletExtensionOptions();

  expect(result).toBeFalsy();
});

test('getWalletExtensionOptions no return', () => {
  const mockOptions = {
    sdk: SDKType.FortmaticIOS,
    ext: {
      flow: {
        rpcUrl: 'http://mock url',
        chainType: WalletType.FLOW,
      },
    },
  };

  stubGetOptionsFromEndpoint(mockOptions);

  const result = network.getWalletExtensionOptions();

  expect(result).toBeFalsy();
});

test('getLedgerNodeUrl return ledger node url', () => {
  const mockLedgerNodeUrl = 'http://mock url';
  const mockOptions = {
    sdk: SDKType.MagicSDK,
    ext: {
      flow: {
        rpcUrl: mockLedgerNodeUrl,
        chainType: WalletType.FLOW,
      },
    },
  };

  stubGetOptionsFromEndpoint(mockOptions);

  const result = network.getLedgerNodeUrl();

  expect(result).toEqual(mockLedgerNodeUrl);
});

test('getLedgerNodeUrl return custom node url', () => {
  const mockCustomNodeUrl = 'http://mock url';
  const mockOptions = { ETH_NETWORK: { rpcUrl: mockCustomNodeUrl } };

  stubGetOptionsFromEndpoint(mockOptions);

  const result = network.getLedgerNodeUrl();

  expect(result).toEqual(mockCustomNodeUrl);
});

const networkNames = ['mainnet', 'goerli', 'sepolia', 'MAINNET', 'GOERLI', 'SEPOLIA'];

// eslint-disable-next-line array-callback-return
networkNames.map(networkName => {
  test(`getNetworkUrl returns ${networkName} url`, () => {
    const mockOptions = { ETH_NETWORK: networkName };

    stubGetOptionsFromEndpoint(mockOptions);

    const result = network.getETHNetworkUrl();

    const expectedNetworkUrl = sample(get(ethereum, `provider_http_urls.prod.${networkName.toLowerCase()}`));

    expect(result).toEqual(expectedNetworkUrl);
  });
});

test('getNetworkUrl return custom node url', () => {
  const mockCustomNodeNetworkUrl = 'https://mock url';
  stubGetOptionsFromEndpoint({ ETH_NETWORK: { rpcUrl: mockCustomNodeNetworkUrl } });

  const result = network.getETHNetworkUrl();

  expect(result).toEqual(mockCustomNodeNetworkUrl);
});

test('mobile return custom node url', () => {
  const mockCustomNodeNetworkUrl = 'https://mock url';
  stubGetOptionsFromEndpoint({ sdk: SDKType.MagicRN, ETH_NETWORK: { rpcUrl: mockCustomNodeNetworkUrl } });

  const result = network.getETHNetworkUrl();

  expect(result).toEqual(mockCustomNodeNetworkUrl);
});

test('mobile return goerli when network even with live key', () => {
  stubGetApiKey('pk_live_abc');
  stubGetOptionsFromEndpoint({ sdk: SDKType.MagicUnity, ETH_NETWORK: 'goerli' });

  const result = network.getNetworkName();

  expect(result).toEqual('goerli');
});

test('mobile return mainnet when network even with live key', () => {
  stubGetApiKey('pk_live_abc');
  stubGetOptionsFromEndpoint({ sdk: SDKType.MagicUnity });

  const result = network.getNetworkName();

  expect(result).toEqual('mainnet');
});
