import React from 'react';
import { JsonRpcRequestPayload } from 'magic-sdk';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { connectStore } from '~/features/connect-with-ui/store';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { store } from '~/app/store';
import { UserThunks } from '~/app/store/user/user.thunks';
import { resolvePayload } from '~/app/rpc/utils';
import { redirectThirdPartyWallet, trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { compareSignerUserAddress } from '../blockchain-ui-methods.controller';
import { SignatureRequestPage } from '../pages/signature-request-page';
import { normalizeTypedData } from '~/app/libs/normalize-typed-data';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';

function useSignTypedDataV4Pages() {
  /* Marshall SignatureRequestPage parameters for MC SignTypedData V4 */
  const payload: JsonRpcRequestPayload<any> | undefined = useSelector(state => state.UIThread.payload);
  const message = payload?.params[1];
  let sigResult;
  const onSignRequest = async () => {
    if (!payload) return;
    sigResult = await store.dispatch(UserThunks.signTypedDataV4ForUser(normalizeTypedData(message)));
  };
  const onComplete = () => {
    if (!payload || !sigResult) return;
    resolvePayload(payload, sigResult);
  };

  /* Construct Page Controller */
  const { routes, createPageResolver } = useController([
    {
      id: 'eth-sign-typed-data-v4',
      content: <SignatureRequestPage message={message} onComplete={onComplete} onSignRequest={onSignRequest} />,
    },
  ]);
  const resolver = createPageResolver(() => 'eth-sign-typed-data-v4');
  return { routes, resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const signTypedDataV4 = useSignTypedDataV4Pages();

  const { page, resolvePage } = useController([...signTypedDataV4.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);

  return (
    <connectStore.Provider>
      <Modal.RPC>
        <div id="modal-portal">
          <MultiChainInfo>{page}</MultiChainInfo>
        </div>
      </Modal.RPC>
    </connectStore.Provider>
  );
};

const mwui_eth_signTypedData_v4: RpcRouteConfig = {
  middlewares: [
    atomic(),
    redirectThirdPartyWallet,
    hydrateUserOrReject,
    compareSignerUserAddress,
    trackPageMiddleware,
    showUI.force,
  ],
  render: () => <PageRender />,
};

export default createFeatureModule.RPC(mwui_eth_signTypedData_v4);
