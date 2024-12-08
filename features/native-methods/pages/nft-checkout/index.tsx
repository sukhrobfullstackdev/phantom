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
import { NFTCheckoutErrorPage } from './pages/nft-checkout-error-page/nft-checkout-error-page';
import { NFTCheckoutReceivePage } from './pages/nft-checkout-receive-page/nft-checkout-receive-page';
import { NFTCheckoutCryptoPage } from './pages/nft-checkout-crypto-page/nft-checkout-crypto-page';
import { NFTCheckoutConfirmedPage } from './pages/nft-checkout-confirmed-page/nft-checkout-confirmed-page';
import { NFTCheckoutMintingPage } from './pages/nft-checkout-minting-page/nft-checkout-minting-page';
import { NFTCheckoutSuccessPage } from './pages/nft-checkout-success-page/nft-checkout-success-page';
import { NFTCheckoutConfirmingPage } from './pages/nft-checkout-confirming-page/nft-checkout-confirming-page';
import { NFTCheckoutCardFormPage } from './pages/nft-checkout-card-form-page/nft-checkout-card-form-page';
import { NFTCheckoutPaypalPage } from './pages/nft-checkout-paypal-page/nft-checkout-paypal-page';
import { NFTCheckoutHomePage } from './pages/nft-checkout-home-page/nft-checkout-home-page';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';
import { MotionLoading } from '../../components/motion-loading/motion-loading';
import { globalQueryClient } from '../../lib/query/global-query-client';
import { ErrorBoundary } from '~/app/libs/exceptions/error-boundary';
import { checkNFTCheckoutRequest } from './middlewares';
import { NFTCheckoutInitializer } from './components/nft-checkout-intializer';

function useNFTCheckoutPages() {
  const { routes, createPageResolver } = useController([
    { id: 'nft-checkout-home', content: <NFTCheckoutHomePage /> },
    { id: 'nft-checkout-card-form', content: <NFTCheckoutCardFormPage /> },
    { id: 'nft-checkout-crypto', content: <NFTCheckoutCryptoPage /> },
    { id: 'nft-checkout-paypal', content: <NFTCheckoutPaypalPage /> },
    { id: 'nft-checkout-confirming', content: <NFTCheckoutConfirmingPage /> },
    { id: 'nft-checkout-confirmed', content: <NFTCheckoutConfirmedPage /> },
    { id: 'nft-checkout-minting', content: <NFTCheckoutMintingPage /> },
    { id: 'nft-checkout-success', content: <NFTCheckoutSuccessPage /> },
    { id: 'nft-checkout-error', content: <NFTCheckoutErrorPage /> },
    { id: 'nft-checkout-receive', content: <NFTCheckoutReceivePage /> },
  ]);
  const resolver = createPageResolver(() => 'nft-checkout-home');
  return { routes, resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const pages = useNFTCheckoutPages();

  const { page, resolvePage } = useController([...pages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);

  return (
    <QueryClientProvider client={globalQueryClient}>
      <Modal.RPC>
        <div id="modal-portal">
          <MultiChainInfo>
            <ErrorBoundary fallback={error => <NFTCheckoutErrorPage error={error} />}>
              <Suspense fallback={<MotionLoading key="nft-checkout-loading" />}>
                <NFTCheckoutInitializer>{page}</NFTCheckoutInitializer>
              </Suspense>
            </ErrorBoundary>
          </MultiChainInfo>
        </div>
      </Modal.RPC>
    </QueryClientProvider>
  );
};

const magic_nft_checkout: RpcRouteConfig = {
  middlewares: [atomic(), hydrateUserOrReject, checkNFTCheckoutRequest, trackPageMiddleware, showUI.force],
  render: () => <PageRender />,
};

export default createFeatureModule.RPC(magic_nft_checkout);
