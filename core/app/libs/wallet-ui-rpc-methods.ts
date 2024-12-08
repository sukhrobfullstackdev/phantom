import {
  MC_WALLET,
  MAGIC_WALLET,
  MAGIC_SHOW_ADDRESS,
  MAGIC_SHOW_FIAT_ONRAMP,
  MAGIC_SHOW_SEND_TOKENS_UI,
  MAGIC_SHOW_NFTS,
  MAGIC_SHOW_BALANCES,
} from '../constants/route-methods';

const WalletUIRpcMethods = [
  MC_WALLET,
  MAGIC_WALLET,
  MAGIC_SHOW_ADDRESS,
  MAGIC_SHOW_FIAT_ONRAMP,
  MAGIC_SHOW_SEND_TOKENS_UI,
  MAGIC_SHOW_NFTS,
  MAGIC_SHOW_BALANCES,
];

export const isWalletHubRpcMethod = payload => {
  return payload?.method === MC_WALLET || payload?.method === MAGIC_WALLET;
};

export const isWalletUIRpcMethod = payload => {
  return WalletUIRpcMethods.some(rpcMethod => rpcMethod === payload?.method);
};
