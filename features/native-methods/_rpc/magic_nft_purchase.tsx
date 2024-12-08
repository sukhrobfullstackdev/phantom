import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { ChainInfo } from '~/features/connect-with-ui/hooks/chainInfoContext';
import { trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { NFTPurchase } from '~/features/native-methods/pages/nft-purchase';
import { nftPurchaseStore } from '../store/nft-purchase/nft-purchase.store';
import { marshallNFTPurchaseState } from '../store/nft-purchase/nft-purchase.middleware';

function useNFTPurchasePages() {
  const { routes, createPageResolver } = useController([{ id: 'nft-purchase', content: <NFTPurchase /> }]);
  const resolver = createPageResolver(() => 'nft-purchase');
  return { routes, resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const pages = useNFTPurchasePages();

  const { page, resolvePage } = useController([...pages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);

  return (
    <nftPurchaseStore.Provider>
      <Modal.RPC>
        <div id="modal-portal">
          <ChainInfo>{page}</ChainInfo>
        </div>
      </Modal.RPC>
    </nftPurchaseStore.Provider>
  );
};

const magic_nft_purchase: RpcRouteConfig = {
  middlewares: [atomic(), hydrateUserOrReject, marshallNFTPurchaseState, trackPageMiddleware, showUI.force],
  render: () => <PageRender />,
};

export default createFeatureModule.RPC(magic_nft_purchase);
