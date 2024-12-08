import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { connectStore } from '~/features/connect-with-ui/store';
import { nativeMethodsStore } from '~/features/native-methods/store/native-methods.store';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';
import { ChainInfo } from '~/features/connect-with-ui/hooks/chainInfoContext';
import { trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { rejectIfWalletUINotEnabled } from '~/app/rpc/controllers/feature-route.controller';
import { CollectibleDetailsPage } from '~/features/native-methods/pages/collectible-details-page';
import { store } from '~/app/store';
import { CollectiblesList } from '~/features/connect-with-ui/components/collectibles-list';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Network } from '~/features/connect-with-ui/components/network';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { globalQueryClient } from '../lib/query/global-query-client';

const CollectiblesListPage = () => {
  return (
    <div>
      <ModalHeader rightAction={<CancelActionButton />} header={<Network />} />
      <Spacer size={32} orientation="vertical" />
      <Typography.H3 style={{ fontSize: '20px' }}>Collectibles</Typography.H3>
      <Spacer size={24} orientation="vertical" />
      <Flex.Column style={{ overflow: 'auto', maxHeight: '680px', textAlign: 'center' }}>
        <CollectiblesList noPadding />
      </Flex.Column>
    </div>
  );
};

export function useShowNftsPages() {
  const { LAUNCH_DARKLY_FEATURE_FLAGS, CLIENT_FEATURE_FLAGS } = store.hooks.useSelector(state => {
    return state.System;
  });

  const isNftTransferEnabled: boolean =
    LAUNCH_DARKLY_FEATURE_FLAGS['is-nft-transfer-enabled'] && CLIENT_FEATURE_FLAGS.is_nft_transfer_enabled;

  const { routes, createPageResolver } = useController([
    {
      id: 'collectibles-list',
      content: <CollectiblesListPage />,
    },
    { id: 'collectible-details', content: <CollectibleDetailsPage isNftTransferEnabled={isNftTransferEnabled} /> },
  ]);
  const resolver = createPageResolver(() => 'collectibles-list');
  return { routes, resolver };
}

export const ShowNftsPageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const pages = useShowNftsPages();
  const payload = store.hooks.useSelector(state => state.UIThread.payload);
  const { page, resolvePage } = useController([...pages.routes, ...genericErrorPages.routes], {
    initialPage: payload?.params?.[payload?.params?.length - 1]?.pageId ?? 'collectibles-list',
  });
  resolvePage(genericErrorPages.resolver);

  useEffect(() => {
    const current = payload?.params?.[payload?.params.length - 1];

    if (current?.pageId === 'collectible-details') {
      if (current?.contractAddress && current?.tokenId) {
        globalQueryClient.setQueryData(['collectiable-details-state'], {
          contractAddress: current.contractAddress,
          tokenId: current.tokenId,
        });
      }
    }
  }, []);

  return (
    <connectStore.Provider>
      <nativeMethodsStore.Provider>
        <QueryClientProvider client={globalQueryClient}>
          <Modal.RPC>
            <div id="modal-portal">
              <ChainInfo>
                <MultiChainInfo>{page}</MultiChainInfo>
              </ChainInfo>
            </div>
          </Modal.RPC>
        </QueryClientProvider>
      </nativeMethodsStore.Provider>
    </connectStore.Provider>
  );
};

const magic_show_nfts: RpcRouteConfig = {
  middlewares: [atomic(), rejectIfWalletUINotEnabled, hydrateUserOrReject, trackPageMiddleware, showUI.force],
  render: () => <ShowNftsPageRender />,
};

export default createFeatureModule.RPC(magic_show_nfts);
