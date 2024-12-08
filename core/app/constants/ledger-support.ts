import { WalletType } from '~/app/constants/flags';

export const LedgerSupportDictionary = {
  ICON: {
    icx_getBalance: 'getBalance',
    icx_sendTransaction: 'sendTransaction',
    icx_signTransaction: 'signTransaction',
    icx_getAccount: 'getAccount',
  },

  POLKADOT: {
    pdt_signPayload: 'signPayload',
    pdt_signRaw: 'signRaw',
    pdt_sendTransaction: 'sendTransaction',
    pdt_getBalance: 'getBalance',
    pdt_getAccount: 'getAccount',
    pdt_contractCall: 'contractCall',
  },

  HARMONY: {
    hmy_getBalance: 'getBalance',
    hmy_sendTransaction: 'sendTransaction',
  },

  FLOW: {
    flow_signTransaction: 'signTransaction',
    flow_getAccount: 'getAccount',
    flow_composeSendTransaction: 'composeSendFlow',
    flow_composeSendUsdc: 'composeSendUsdc',
    flow_signMessage: 'signMessage',
  },

  TEZOS: {
    tezos_sendTransaction: 'sendTransaction',
    tezos_sendContractOriginationOperation: 'sendContractOrigination',
    tezos_getAccount: 'getAccount',
    tezos_sendContractInvocationOperation: 'sendContractInvocation',
    tezos_sendContractPing: 'sendContractPingOperation',
    tezos_sendDelegationOperation: 'sendDelegation',
  },

  ZILLIQA: {
    zil_sendTransaction: 'sendTransaction',
    zil_deployContract: 'deployContract',
    zil_callContract: 'callContract',
    zil_getWallet: 'getWallet',
  },
  SOLANA: {
    sol_sendTransaction: 'sendTransaction',
    sol_signTransaction: 'signTransaction',
    sol_signMessage: 'signMessage',
    sol_partialSignTransaction: 'partialSignTransaction',
  },
  SUI: {
    sui_signAndSendTransaction: 'signAndSendTransaction',
  },
  AVAX: {
    ava_signTransaction: 'signTransaction',
    ava_getAccount: 'getAccount',
  },
  ALGOD: {
    algod_signTransaction: 'signTransaction',
    algod_signBid: 'signBid',
    algod_getWallet: 'getAccount',
    algod_signGroupTransaction: 'signGroupTransaction',
    algod_signGroupTransactionV2: 'signGroupTransactionV2',
  },
  COSMOS: {
    cos_sign: 'sign',
    cos_sendTokens: 'sendTokens',
    cos_signAndBroadcast: 'signAndBroadcast',
    cos_changeAddress: 'changeAddress',
  },
  BITCOIN: {
    btc_signTransaction: 'signTransaction',
  },
  NEAR: {
    near_signTransaction: 'signTransaction',
    near_getPublicKey: 'getPublicKey',
  },
  CONFLUX: {
    cfx_sendTransaction: 'sendTransaction',
  },
  TERRA: {
    terra_sign: 'sign',
    terra_getPublicKey: 'getPublicKey',
  },
  TAQUITO: {
    taquito_sign: 'sign',
    taquito_getPublicKeyAndHash: 'getPublicKeyAndHash',
  },
  ED: {
    ed_getPublicKey: 'getPublicKey',
    ed_sign: 'sign',
  },
  HEDERA: {
    hedera_sign: 'sign',
    hedera_getPublicKey: 'getPublicKey',
  },

  APTOS: {
    aptos_getAccount: 'getAccount',
    aptos_signTransaction: 'signTransaction',
    aptos_getAccountInfo: 'getAccountInfo',
    aptos_signAndSubmitTransaction: 'signAndSubmitTransaction',
    aptos_signAndSubmitBCSTransaction: 'signAndSubmitBCSTransaction',
    aptos_signMessage: 'signMessage',
    aptos_signMessageAndVerify: 'signMessageAndVerify',
  },
} as const;

export const FlowAddress = {
  testnet: '5a729f879230d5d2',
  mainnet: '0ef92cecf95ba19e',
} as const;

export const FLOW_WALLET_SEED_AMOUNT = '0.009';

export const FLOW_WALLET_SEED_API_KEY_ALLOW_LIST = [
  'pk_live_DF657A2A5F786D8A', // Mattel API key prod [66009]
  'pk_live_3C6B72B24D7049FE', // Mattel API key stage [66009]
  'pk_live_6C231DB7EF945C9E', // Mattel API key prod v2 [66217]
  'pk_live_06D5F65BB9CDD2F0', // demo key for testing, will remove after load test
];

export const HDWalletPath = {
  path0: `m/44'/60'/0'/0/0`,
} as const;

export const HederaAccounts = {
  testnet: {
    accountId: '0.0.3579958', // Account ID from portal.hedera.com
    publicKey: '302a300506032b6570032100497112c22231ec1886cd76163aec7709a677ceb4ea0bf3f2a29ae1ea05f46fbc', // DER encoded public key from portal.hedera.com
  },
  mainnet: {
    accountId: '0.0.1319851',
    publicKey: '302a300506032b65700321003fb848db6eacf859dcdd0af9c883b228adbbb4d5aed92d162320ff7b10c5d638',
  },
} as const;

export const MultiChainTransactionListItems = {
  [WalletType.ETH]: ['sendAmount', 'networkFee', 'total'],
  [WalletType.FLOW]: ['total'],
};

export const MultiChainSecretType = {
  FLOW: 'private key',
  ETH: {
    MC: 'secret phrase',
    AUTH: 'private key',
  },
};
