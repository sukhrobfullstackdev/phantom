import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { connectStore } from '~/features/connect-with-ui/store';
import { LoginPromptPage } from '~/features/connect-with-ui/pages/login-prompt-page';
import {
  redirectThirdPartyWallet,
  resolvePublicAddressIfLoggedIn,
  tryResolvePublicAddress,
} from '~/features/connect-with-ui/connect-with-ui.controller';
import { useLoginWithEmailOtpPages } from '~/features/email-otp/_rpc/magic_auth_login_with_email_otp';
import { store } from '~/app/store';
import { setReturnRoutePageId } from '~/app/store/ui-thread/ui-thread.actions';
import { getWalletConnections } from '../utils/get-wallet-connections';
import { setWalletConnectionsInfo } from '../store/connect.actions';
import { WelcomePage } from '../pages/welcome-page';
import { WalletSelectionPage } from '../pages/wallet-selection-page';
import { WalletQuickConnectPage } from '../pages/wallet-quick-connect-page';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';
import { isGlobalAppScope } from '~/app/libs/connect-utils';

export type LoginFormPagesOptions = {
  onLoginComplete: () => any | (() => Promise<any>);
};

export function useLoginFormPages(
  { onLoginComplete }: LoginFormPagesOptions = {
    onLoginComplete: tryResolvePublicAddress,
  },
) {
  const handleLoginComplete = async () => {
    await store.dispatch(setReturnRoutePageId(''));
    const { Auth } = store.getState();

    let hasAuthWallets;
    if (isGlobalAppScope()) {
      const walletConnections = await getWalletConnections(Auth.userID);
      connectStore.dispatch(setWalletConnectionsInfo(walletConnections));
      hasAuthWallets = walletConnections?.authWallets && walletConnections?.authWallets?.length > 0;
    }
    if (!hasAuthWallets) {
      await onLoginComplete();
    }
  };

  const { routes: otpRoutes } = useLoginWithEmailOtpPages({
    onLoginComplete: handleLoginComplete,
  });

  const { routes, createPageResolver } = useController([
    { id: 'login-prompt', content: <LoginPromptPage onComplete={handleLoginComplete} /> },
    {
      id: 'welcome-page',
      content: <WelcomePage />,
    },
    {
      id: 'wallet-selection-page',
      content: <WalletSelectionPage />,
    },
    {
      id: 'wallet-quick-connect-page',
      content: <WalletQuickConnectPage />,
    },
    ...otpRoutes,
  ]);
  const resolver = createPageResolver(() => 'login-prompt');

  return { routes, resolver };
}

export const LoginFormPageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const loginFormPages = useLoginFormPages();

  const { page, resolvePage } = useController([...loginFormPages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);

  return (
    <connectStore.Provider>
      <Modal.RPC>
        <MultiChainInfo>
          <div id="modal-portal">{page}</div>
        </MultiChainInfo>
      </Modal.RPC>
    </connectStore.Provider>
  );
};

const mc_flow_getAccount: RpcRouteConfig = {
  middlewares: [atomic(), redirectThirdPartyWallet, resolvePublicAddressIfLoggedIn, showUI.force],
  render: () => <LoginFormPageRender />,
};

export default createFeatureModule.RPC(mc_flow_getAccount);
