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
import { resolvePayload } from '~/app/rpc/utils';
import { redirectThirdPartyWallet, trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { compareSignerUserAddress } from '../blockchain-ui-methods.controller';
import { MultiChainSignTransactionPage } from '~/features/blockchain-ui-methods/pages/multi-chain-sign-transaction-page';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';
import { MultiChainThunks } from '~/app/store/multiChain/multichian.thunks';

function useFlowSignTransactionPages() {
  const payload: JsonRpcRequestPayload<any> | undefined = useSelector(state => state.UIThread.payload);
  const cadence = payload?.params?.cadence;
  let sigResult;
  const onSignRequest = async () => {
    if (!payload) return;
    sigResult = await store.dispatch(MultiChainThunks.handleLedgerPayload(payload));
  };
  const onComplete = () => {
    if (!payload || !sigResult) return;
    resolvePayload(payload, sigResult);
  };

  /* Construct Page Controller */
  const { routes, createPageResolver } = useController([
    {
      id: 'flow_signTransaction',
      content: (
        <MultiChainSignTransactionPage contract={cadence} onSignRequest={onSignRequest} onComplete={onComplete} />
      ),
    },
  ]);
  const resolver = createPageResolver(() => 'flow_signTransaction');
  return { routes, resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const flowSignTransactionPages = useFlowSignTransactionPages();

  const { page, resolvePage } = useController([...flowSignTransactionPages.routes, ...genericErrorPages.routes]);
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

const mc_flow_signTransaction: RpcRouteConfig = {
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

export default createFeatureModule.RPC(mc_flow_signTransaction);
