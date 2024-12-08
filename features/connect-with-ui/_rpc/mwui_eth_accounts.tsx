/*
 * LEGACY BEHAVIOR. eth_accounts currently pops up the login ui.
 * This behavior is outdated. It should return [] if no one is logged in
 * and [public_key,...] if someone is logged in. But not prompt the login.
 * See mc_eth_requestAccounts
 */

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
  connectMiddleware,
  redirectThirdPartyWallet,
  resolvePublicAddressIfLoggedIn,
  tryResolvePublicAddress,
} from '~/features/connect-with-ui/connect-with-ui.controller';
import { useLoginWithEmailOtpPages } from '~/features/email-otp/_rpc/magic_auth_login_with_email_otp';
import { WelcomePage } from '../pages/welcome-page';
import { WalletSelectionPage } from '../pages/wallet-selection-page';
import { WalletQuickConnectPage } from '../pages/wallet-quick-connect-page';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';
import { isSdkVersionGreaterThanOrEqualTo } from '~/app/libs/is-version-greater-than';
import { resolvePayload } from '~/app/rpc/utils';
import { handleLoginComplete } from '../hooks/useLoginFormPages';
import { isGlobalAppScope } from '~/app/libs/connect-utils';
import { ETH_ACCOUNTS } from '~/app/constants/eth-rpc-methods';
import { sdkErrorFactories } from '~/app/libs/exceptions';

export type OldLoginFormPagesOptions = {
  onLoginComplete: () => any | (() => Promise<any>);
};

export function useOldLoginFormPages(
  { onLoginComplete }: OldLoginFormPagesOptions = {
    onLoginComplete: tryResolvePublicAddress,
  },
) {
  const { routes: otpRoutes } = useLoginWithEmailOtpPages({
    onLoginComplete: () => handleLoginComplete(onLoginComplete),
  });

  const { routes, createPageResolver } = useController([
    { id: 'login-prompt', content: <LoginPromptPage onComplete={() => handleLoginComplete(onLoginComplete)} /> },
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

export const OldLoginFormPageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const loginFormPages = useOldLoginFormPages();

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

const resolveIfVersionSeventeenOrGreater: connectMiddleware = async (ctx, next) => {
  // Conditional logic against the magic-sdk version to ensure it doesn't interrupt
  // how existing devs may be handling the error
  if (isSdkVersionGreaterThanOrEqualTo('17.0.0')) {
    const didResolveAddress = await tryResolvePublicAddress(ctx.payload);
    if (!didResolveAddress) {
      return resolvePayload(ctx.payload, []);
    }
  }
  next();
};

const rejectIfAuthApp: connectMiddleware = async (ctx, next) => {
  if (!isGlobalAppScope() && ctx.payload.method === `mwui_${ETH_ACCOUNTS}`) {
    await sdkErrorFactories.client.userDeniedAccountAccess().sdkReject(ctx.payload);
    return;
  }
  next();
};
const mwui_eth_accounts: RpcRouteConfig = {
  middlewares: [
    atomic(),
    redirectThirdPartyWallet,
    resolveIfVersionSeventeenOrGreater,
    resolvePublicAddressIfLoggedIn,
    rejectIfAuthApp,
    showUI.force,
  ],
  render: () => <OldLoginFormPageRender />,
};

export default createFeatureModule.RPC(mwui_eth_accounts);
