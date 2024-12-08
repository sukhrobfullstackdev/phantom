import { capitalize, get } from '~/app/libs/lodash-utils';
import { getApiKey } from '~/app/libs/api-key';
import { FLOW_WALLET_SEED_API_KEY_ALLOW_LIST, LedgerSupportDictionary } from '../constants/ledger-support';
import { AuthenticationService } from '../services/authentication';
import { store } from '../store';
import { getChainId, getLedgerNodeUrl, getWalletExtensionOptions, getWalletType } from './network';

interface BridgeResult {
  ledgerMethodsMapping: Record<string, string>;
  ledgerBridge: any;
}

/* Ignore this function because we don't test imported packages */
/* istanbul ignore next */
const ledgerMap: { [index: string]: any } = {
  TezosBridge: () => import('@fortmatic/ledger-bridge-tezos'),
  HarmonyBridge: () => import('@fortmatic/ledger-bridge-harmony'),
  FlowBridge: () => import('@fortmatic/ledger-bridge-flow'),
  IconBridge: () => import('@fortmatic/ledger-bridge-icon'),
  ZilliqaBridge: () => import('@fortmatic/ledger-bridge-zilliqa'),
  PolkadotBridge: () => import('@fortmatic/ledger-bridge-polkadot'),
  SolanaBridge: () => import('@fortmatic/ledger-bridge-solana'),
  AvaxBridge: () => import('@fortmatic/ledger-bridge-avalanche'),
  AlgodBridge: () => import('@fortmatic/ledger-bridge-algorand'),
  CosmosBridge: () => import('@fortmatic/ledger-bridge-cosmos'),
  BitcoinBridge: () => import('@fortmatic/ledger-bridge-bitcoin'),
  NearBridge: () => import('@fortmatic/ledger-bridge-near'),
  ConfluxBridge: () => import('@fortmatic/ledger-bridge-conflux'),
  TerraBridge: () => import('@fortmatic/ledger-bridge-terra'),
  TaquitoBridge: () => import('@fortmatic/ledger-bridge-taquito'),
  EdBridge: () => import('@fortmatic/ledger-bridge-ed'),
  HederaBridge: () => import('@fortmatic/ledger-bridge-hedera'),
  AptosBridge: () => import('@fortmatic/ledger-bridge-aptos'),
  SuiBridge: () => import('@fortmatic/ledger-bridge-sui'),
};

async function ledgerGetAccounts() {
  const { data } = await AuthenticationService.getUser(store.getState().Auth.userID, getWalletType());
  return data.public_address;
}

export async function getSolanaLedgerBridge() {
  const rpcUrl = getLedgerNodeUrl();
  const chainId = getChainId();
  const extensionOptions = getWalletExtensionOptions();
  const Bridge = (await get(ledgerMap, `SolanaBridge`)()).default;
  return new Bridge(rpcUrl, chainId, extensionOptions);
}

export async function createBridge(): Promise<BridgeResult> {
  const walletType = getWalletType();
  const rpcUrl = getLedgerNodeUrl();
  const chainId = getChainId();
  const extensionOptions = getWalletExtensionOptions();

  const Bridge = (await get(ledgerMap, `${capitalize(walletType)}Bridge`)()).default;

  const ledgerBridge = new Bridge(rpcUrl, chainId, extensionOptions);

  ledgerBridge.getAccount = ledgerGetAccounts;

  return {
    ledgerMethodsMapping: LedgerSupportDictionary?.[walletType],
    ledgerBridge,
  };
}

export const shouldSeedFlowWallet = network => {
  const apiKey = getApiKey() as string;
  if (network === 'mainnet') {
    return FLOW_WALLET_SEED_API_KEY_ALLOW_LIST.includes(apiKey);
  }
  return true;
};
