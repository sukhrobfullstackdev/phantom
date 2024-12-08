import React, { Suspense } from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFeatureFlags } from '~/features/hooks/use-feature-flags';
import { Typography } from '@magiclabs/ui';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';
import { NFTTransferErrorPage } from './pages/nft-transfer-error-page/nft-transfer-error-page';
import { MotionLoading } from '../../components/motion-loading/motion-loading';
import { globalQueryClient } from '../../lib/query/global-query-client';
import { NFTTransferComposePage } from './pages/nft-transfer-compose-page/nft-transfer-compose-page';
import { NFTTransferConfirmPage } from './pages/nft-transfer-comfirm-page/nft-transfer-comfirm-page';
import { NFTTransferPendingPage } from './pages/nft-transfer-pending-page/nft-transfer-pending-page';
import { ErrorBoundary } from '~/app/libs/exceptions/error-boundary';
import { checkNFTTransferRequest } from './middlewares';
import { NFTTransferInitializer } from './components/nft-transfer-initializer';

function useNFTTransferPages() {
  const { routes, createPageResolver } = useController([
    {
      id: 'nft-transfer-compose',
      content: <NFTTransferComposePage />,
    },
    {
      id: 'nft-transfer-confirm',
      content: <NFTTransferConfirmPage />,
    },
    {
      id: 'nft-transfer-pending',
      content: <NFTTransferPendingPage />,
    },
    {
      id: 'nft-transfer-error',
      content: <NFTTransferErrorPage />,
    },
  ]);
  const resolver = createPageResolver(() => 'nft-transfer-compose');
  return { routes, resolver };
}

export const MagicNFTTransferPageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const pages = useNFTTransferPages();

  const { CLIENT_FEATURE_FLAGS } = useFeatureFlags();

  const { page, resolvePage } = useController([...pages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);

  return (
    <QueryClientProvider client={globalQueryClient}>
      <Modal.RPC>
        <div id="modal-portal">
          {/* {CLIENT_FEATURE_FLAGS.is_nft_transfer_enabled ? ( */}
            <MultiChainInfo>
              <ErrorBoundary fallback={(error, reset) => <NFTTransferErrorPage error={error} reset={reset} />}>
                <Suspense fallback={<MotionLoading key="nft-transfer-loading" />}>
                  <NFTTransferInitializer>{page}</NFTTransferInitializer>
                </Suspense>
              </ErrorBoundary>
            </MultiChainInfo>
          {/* ) : (
            <Typography.BodyMedium>NFT Transfer Disabled</Typography.BodyMedium>
          )} */}
        </div>
      </Modal.RPC>
    </QueryClientProvider>
  );
};

const magic_nft_transfer: RpcRouteConfig = {
  middlewares: [atomic(), hydrateUserOrReject, checkNFTTransferRequest, trackPageMiddleware, showUI.force],
  render: () => <MagicNFTTransferPageRender />,
};

export default createFeatureModule.RPC(magic_nft_transfer);
