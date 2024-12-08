import { encryptAndSyncWallet } from './encrypt-and-sync-wallet';
import { reconstructWalletPk, reconstructWalletMnemonic } from './reconstruct-wallet-keys';
import { getJwt } from './get-jwt';

export const DkmsService = {
  encryptAndSyncWallet,
  getJwt,
  reconstructWalletPk,
  reconstructWalletMnemonic,
};
