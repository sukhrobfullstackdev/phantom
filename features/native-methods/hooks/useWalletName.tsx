import { useMemo } from 'react';
import { store } from '~/app/store';
import { formatAppName } from '~/features/connect-with-ui/utils/format-app-name';

export const useWalletName = () => {
  const { activeAuthWallet } = store.hooks.useSelector(state => state.User);
  const { appScope } = store.hooks.useSelector(state => state.System);
  const { appName } = store.hooks.useSelector(state => state.Theme.theme);

  const walletName = useMemo(() => {
    const isMA = !!activeAuthWallet || appScope === 'app';
    return isMA ? `${formatAppName(appName)} Wallet` : 'Magic Wallet';
  }, [appName, activeAuthWallet, appScope]);

  return { walletName };
};
