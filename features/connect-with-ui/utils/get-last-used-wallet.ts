import { isNil } from '~/app/libs/lodash-utils';

import { AuthWalletType, ConnectWalletType } from './get-wallet-connections';

export const getLastUsedWallet = (
  wallets: (AuthWalletType | ConnectWalletType)[],
): AuthWalletType | ConnectWalletType => {
  const lastUsedWallet = wallets.reduce((previousWallet, currentWallet) => {
    if (isNil(currentWallet.time_last_selected_ms)) {
      return previousWallet;
    }
    if (isNil(previousWallet?.time_last_selected_ms)) {
      return currentWallet;
    }
    return previousWallet.time_last_selected_ms > currentWallet.time_last_selected_ms ? previousWallet : currentWallet;
  });
  return lastUsedWallet;
};
