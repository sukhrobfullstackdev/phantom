import { isMagicWalletDapp } from '~/app/libs/connect-utils';
import { store } from '~/app/store';
import { setWalletQuickConnectRouteParams } from '~/app/store/user/user.actions';
import { connectStore } from '../store';
import { getLastUsedWallet } from './get-last-used-wallet';
import { AuthWalletType } from './get-wallet-connections';

type Route = 'welcome-page' | 'wallet-selection-page' | 'wallet-quick-connect-page' | 'resolve';

export const userHasOneAuthWalletWithMfa = (authWallets: AuthWalletType[] | undefined) => {
  return authWallets?.length === 1 && authWallets[0].is_mfa_enabled;
};

export const getRouteForMcUserIfSignUpOrHasAuthWallets = (): Route => {
  const { Auth } = store.getState();
  const { walletConnectionsInfo } = connectStore.getState();
  // Only show welcome screen if new user on magic wallet dapp
  if (Auth.isNewUser && isMagicWalletDapp()) {
    return 'welcome-page';
  }
  if (userHasOneAuthWalletWithMfa(walletConnectionsInfo?.authWallets)) {
    return 'resolve';
  }
  if (walletConnectionsInfo?.authWallets.length && walletConnectionsInfo?.authWallets.length > 0) {
    if (walletConnectionsInfo.isFirstExposure) {
      return 'wallet-selection-page';
    }
    const lastUsedWallet = getLastUsedWallet([
      ...walletConnectionsInfo.connectWallets,
      ...walletConnectionsInfo.authWallets,
    ]);

    if (lastUsedWallet.time_last_selected_ms) {
      const isMfaEnabledOnLastUsedWallet = (lastUsedWallet as AuthWalletType).is_mfa_enabled;
      if (isMfaEnabledOnLastUsedWallet) {
        return 'wallet-selection-page';
      }
      store.dispatch(setWalletQuickConnectRouteParams(lastUsedWallet));
      return 'wallet-quick-connect-page';
    }
  }
  return 'resolve';
};
