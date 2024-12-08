import { AccountsBase } from 'web3-core';
import Accounts from 'web3-eth-accounts';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { getETHNetworkUrl } from '~/app/libs/network';
import { HDWalletPath } from '~/app/constants/ledger-support';

// Definition file for `web3-eth-accounts` is broken. `Accounts` should be the
// default export...
// @see https://github.com/ethereum/web3.js/issues/3292
declare module 'web3-eth-accounts' {
  /* eslint-disable no-shadow */
  export default class Accounts extends AccountsBase {}
}

export function createWallet() {
  const mnemonic = bip39.generateMnemonic();
  const hdwallet = ethers.utils.HDNode.fromMnemonic(mnemonic);

  const { privateKey, address } = hdwallet.derivePath(HDWalletPath.path0);

  return {
    privateKey,
    address,
    mnemonic,
    HDWalletPath: HDWalletPath.path0,
  };
}

export function privateKeyToAccount(privateKey: string) {
  const accounts = new Accounts(getETHNetworkUrl());
  return accounts.privateKeyToAccount(privateKey);
}
