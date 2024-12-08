import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController, useControllerContext } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { connectStore } from '~/features/connect-with-ui/store';
import { useLoginFormPages } from '~/features/connect-with-ui/hooks/useLoginFormPages';
import { RequestUserInfoPage } from '~/features/connect-with-ui/pages/request-user-info-page/request-user-info-page';
import {
  tryHydrateMagicUser,
  marshallRequestUserInfoParams,
  resolveIfDappEmailConsentGranted,
  premiumFeatureCheck,
} from '~/features/connect-with-ui/pages/request-user-info-page/request-user-info.controller';
import { eventData, getLoginMethod } from '~/features/connect-with-ui/utils/get-login-method';
import { trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { RequestUserInfoThirdPartyWalletPage } from '~/features/connect-with-ui/pages/request-user-info-page/request-user-info-third-party-wallet-page';
import { RequestUserInfoThirdPartyWalletPromptPage } from '~/features/connect-with-ui/pages/request-user-info-page/request-user-info-third-party-wallet-prompt';
import { RequestUserInfoThirdPartyWalletEmailVerify } from '~/features/connect-with-ui/pages/request-user-info-page/request-user-info-third-party-wallet-email-verify';
import { RpcMiddleware } from '~/app/rpc/types';
import { isGlobalAppScope } from '~/app/libs/connect-utils';
import { rejectPayload } from '~/app/rpc/utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';

export const ifScopedAppRejectMagicRPC: RpcMiddleware = ({ payload }, next) => {
  if (!isGlobalAppScope()) {
    const sdkErrorMsg =
      'Your app already has access to all collected user information. Use magic.user.getInfo() instead.';
    rejectPayload(payload, sdkErrorFactories.magic.unsupportedSDKMethodForScopedWalletApps(sdkErrorMsg));
  } else {
    next();
  }
};

function useRequestUserInfoPages() {
  const pageRoutes = [
    {
      id: 'request-user-info',
      content: <RequestUserInfoPage />,
    },
    {
      id: 'request-user-info-third-party-wallet',
      content: <RequestUserInfoThirdPartyWalletPage />,
    },
    {
      id: 'request-user-info-third-party-wallet-prompt',
      content: <RequestUserInfoThirdPartyWalletPromptPage />,
    },
    {
      id: 'request-user-info-third-party-wallet-email-verify',
      content: <RequestUserInfoThirdPartyWalletEmailVerify />,
    },
  ];

  const { routes, createPageResolver } = useController(pageRoutes);
  const { navigateTo } = useControllerContext();
  const loginPages = useLoginFormPages({
    onLoginComplete: () => {
      navigateTo('request-user-info', eventData);
    },
  });
  const resolver = createPageResolver(() => 'request-user-info');
  return { routes: [...routes, ...loginPages.routes], resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const pages = useRequestUserInfoPages();

  const loginMethod = getLoginMethod();
  let initialPage = 'request-user-info';
  if (['WALLET_CONNECT', 'COINBASE_WALLET', 'METAMASK'].includes(loginMethod?.mc.loginMethod || '')) {
    initialPage = 'request-user-info-third-party-wallet';
  }
  const { page, resolvePage } = useController([...pages.routes, ...genericErrorPages.routes], {
    initialPage,
  });
  resolvePage(genericErrorPages.resolver);

  return (
    <connectStore.Provider>
      <Modal.RPC>
        <div id="modal-portal">{page}</div>
      </Modal.RPC>
    </connectStore.Provider>
  );
};

const mc_request_user_info: RpcRouteConfig = {
  middlewares: [
    atomic(),
    ifScopedAppRejectMagicRPC,
    premiumFeatureCheck,
    tryHydrateMagicUser,
    marshallRequestUserInfoParams,
    resolveIfDappEmailConsentGranted,
    trackPageMiddleware,
    showUI.force,
  ],
  render: () => <PageRender />,
};

export default createFeatureModule.RPC(mc_request_user_info);
