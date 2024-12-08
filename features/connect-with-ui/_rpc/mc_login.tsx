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
import { resolvePublicAddressIfLoggedIn } from '~/features/connect-with-ui/connect-with-ui.controller';
import { useLoginFormPages } from '../hooks/useLoginFormPages';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';

export type LoginFormPagesOptions = {
  onLoginComplete: () => any | (() => Promise<any>);
};

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

const mc_login: RpcRouteConfig = {
  middlewares: [atomic(), resolvePublicAddressIfLoggedIn, showUI.force],
  render: () => <LoginFormPageRender />,
};

export default createFeatureModule.RPC(mc_login);
